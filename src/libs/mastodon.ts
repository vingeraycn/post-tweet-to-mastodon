import chalk from 'chalk'
import { login } from 'masto'
import { MASTODON_URL, MASTODON_ACCESS_TOKEN } from '../config'
import { isEmpty } from './validator'

export function checkMastodonSecrets() {
  if (isEmpty(MASTODON_URL)) {
    throw new Error(`The MASTODON_URL is missing in your environment`)
  }
  if (isEmpty(MASTODON_ACCESS_TOKEN)) {
    throw new Error(`The MASTODON_ACCESS_TOKEN is missing in your environment`)
  }
}

type Client = Awaited<ReturnType<typeof login>>
let mastodonClient: Client | null = null
export async function getMastodonClient() {
  return (
    mastodonClient ||
    (mastodonClient = await login({
      url: MASTODON_URL,
      accessToken: MASTODON_ACCESS_TOKEN,
    }))
  )
}

export async function postToMastodon(text: string): Promise<void> {
  checkMastodonSecrets()
  const masto = await getMastodonClient()

  await masto.v1.statuses.create({
    status: text,
    visibility: 'public',
  })
  console.log(chalk.green('Tweet posted to Mastodon successfully!'))
}

type Status = Awaited<ReturnType<Client['v1']['accounts']['listStatuses']>>[0]

export type Post = Status

export async function getLatestMastodon(): Promise<Status | undefined> {
  checkMastodonSecrets()
  const masto = await getMastodonClient()
  const { id: accountId } = await masto.v1.accounts.verifyCredentials()

  const statuses = await masto.v1.accounts.listStatuses(accountId, {
    limit: 1,
  })

  console.log('mastodon statuses', statuses)

  return statuses[0]
}
