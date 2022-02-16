import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify'
import wordnet from 'wordnet'

interface Word {
    Params: {
        name: string;
    }
}

const worldList = async (): Promise<string[]> => await wordnet.list().filter(word => !(word.includes('-') || word.includes('.') || new RegExp('([0-9])').exec(word) !== null))

export default async function (instance: FastifyInstance, _opts: FastifyServerOptions, done) {

    instance.register(async (instance: FastifyInstance, _opts: FastifyServerOptions, done) => {
        instance.get('/words', async (_req: FastifyRequest, res: FastifyReply) => {
            res.status(200).send({ wordList: await worldList() })
        })

        instance.get('/words/:name', async (req: FastifyRequest<Word>, res: FastifyReply) => {
            const { name } = req.params
            await wordnet.lookup(name).then((definitions) => res.status(200).send({ glossary: definitions[0].glossary })).catch((_) => res.status(200).send({ glossary: 'No definition found' }))
        })

        instance.get('/word/today', async (req: FastifyRequest, res: FastifyReply) => {
            const wordList = await worldList()
            const todayWord = Math.floor(Math.random() * wordList.length)

            const date = new Date(new Date().setDate(new Date().getDate() + 1))
            date.setHours(0, 0, 0, 0)

            res.setCookie('dictry', wordList[todayWord], { expires: date }).send(null)
        })

        done()
    }, {
        prefix: '/api/v1'
    })

    done()
}