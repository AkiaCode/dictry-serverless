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
        res.status(200).send({ wordList: await worldList() }).setCookie('dictry', 'serverless', { maxAge: 8000000 })
    })

    instance.get('/words/:name', async (req: FastifyRequest<Word>, res: FastifyReply) => {
        const { name } = req.params
        await wordnet.lookup(name).then((definitions: any) => res.status(200).send({ glossary: definitions[0].glossary })).catch((_: unknown) => res.status(200).send({ glossary: 'No definition found' }))
    })

    done()
}