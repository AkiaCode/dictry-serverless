import { FastifyInstance, FastifyReply, FastifyRequest, FastifyServerOptions } from 'fastify'
import wordnet from 'wordnet'

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
        if (req.headers.date === undefined) return res.status(200).send({ error: 'No date header' })
        const wordList = await worldList()

        // https://github.com/cwackerfuss/react-wordle/blob/main/src/lib/words.ts#L56~L60
        const epochMs = new Date('January 1, 2022 00:00:00').valueOf()
        const now = req.headers.date
        const msInDay = 86400000
        const index = Math.floor((Number(now) - epochMs) / msInDay)
        const nextday = (index + 1) * msInDay + epochMs

        res.status(200).send({ word: wordList[index % wordList.length], nextday: nextday })
    })

    done()
}