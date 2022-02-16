import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify'
import wordnet from 'wordnet'
import parser from 'accept-language-parser'

interface Word {
    Params: {
        name: string;
    }
}

const worldList = async (): Promise<string[]> => await wordnet.list().filter(word => !(word.includes('-') || word.includes('.') || new RegExp('([0-9])').exec(word) !== null))

export default async function (instance: FastifyInstance, _opts: FastifyServerOptions, done) {

    instance.get('/words', async (_req: FastifyRequest, res: FastifyReply) => {
        res.status(200).send({ wordList: await worldList() })
    })

    instance.get('/words/:name', async (req: FastifyRequest<Word>, res: FastifyReply) => {
        const { name } = req.params
        await wordnet.lookup(name).then((definitions: any) => res.status(200).send({ glossary: definitions[0].glossary })).catch((_: unknown) => res.status(200).send({ glossary: 'No definition found' }))
    })

    instance.get('/word/today', async (req: FastifyRequest, res: FastifyReply) => {
        const wordList = await worldList()
        const todayWord = Math.floor(Math.random() * wordList.length)

        const now = new Date()
        const date = new Date(now.setDate(now.getDate() + 1))
        date.setHours(0, 0, 0, 0)

        const lang = parser.parse(req.headers['accept-language'])

        if (lang == null) return res.status(200).send({ error: 'No language found' })

        const intl = new Intl.DateTimeFormat(lang[0].code, {year: "numeric", month: "2-digit", day: "2-digit"}).format(date)

        res.setCookie('dictry', wordList[todayWord], { expires: new Date(intl) }).send(null)
    })

    done()
}