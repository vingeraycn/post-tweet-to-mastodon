import * as dotenv from 'dotenv'
dotenv.config()

import chalk from 'chalk'
import { cachePostId, canPost } from './libs/cache'
import { getLatestMastodon } from './libs/mastodon'
import { tweet } from './libs/twitter'

async function main(): Promise<void> {
  const mastodon = await getLatestMastodon()
  if (!mastodon) {
    return
  }
  if (!canPost(mastodon.id)) {
    return
  }

  try {
    // post to twitter
    await tweet(mastodon)
    // cache post id
    cachePostId(mastodon.id)
  } catch (e) {
    console.log(`tweet failed`, e)
  }
}

;(async () => {
  try {
    await main()
    process.exit(0)
  } catch (error: any) {
    console.error(chalk.red(error.message))
    process.exit(1)
  }
})()
