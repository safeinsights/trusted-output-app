import { ResultsWriter } from 'si-encryption/job-results/writer'
import { GET } from './app/api/job/results/route'

// TODO: look up private key in BMA corresponding to job
// Using placeholders for now from https://cryptotools.net/rsagen
const publicKeyPlaceholder1 = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFStw21WlVg2eLXfmAj7lyCiEz
1/OkJOL6K1CWGkrBAa2oP/wVzYHUomQaQQ0SDdQYx4EZZkfehIOoFUwb0B+Cka+F
xGbqlSoEna0+yU6TWB2nPiIRYEya7OLY6V/tU0z8ECYL89uWU4W+IskAxpWvUUuH
rFjDWd0FoH4+yOkOHQIDAQAB`
const publicKeyPlaceholder2 = `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCpGKeRCSeaQnu5pANdXPD+iY4
YzMhGNIEH0VOyF61LAr8Qn3MIgU47opbAA6xPaU8jm/qpN3so10kfmct3ur1iQIJ
W/xW57BZSlb7QqpOEm9Cwfv1yGCVx7KeqJOks51MrUupJZxgWfodWHLKwvxSywN8
RMlHJ3wbr/mWrTW6qwIDAQAB`

export const encryptResults = async () => {
  const writer = new ResultsWriter([
    { fingerprint: 'fingerprint1', publicKey: publicKeyPlaceholder1 },
    { fingerprint: 'fingerprint2', publicKey: publicKeyPlaceholder2 },
  ])

  const results: { jobs: Record<string, any[]> } = await GET().json() // eslint-disable-line
  const jobKeys = Object.keys(results.jobs)

  for (const index in jobKeys) {
    const jobId = jobKeys[index]

    // Encrypt jobResults using ResultsWriter & private keys
    const jobResults = results.jobs[jobId]
    const jobResultsBuffer = new TextEncoder().encode(JSON.stringify(jobResults))
    await writer.addFile(jobId, jobResultsBuffer)
  }
  // console.log(JSON.stringify(writer.manifest))
  const encryptedResults: Blob = await writer.generate()
  return encryptedResults
}

// encryptResults().then((res) => console.log(res))
