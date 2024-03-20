// import chalk from 'chalk'
// import Twit from 'twit'
import { checkServerIdentity } from 'tls'
import {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_AUTH_BEARER_TOKEN,
} from '../config'
import { isEmpty } from './validator'
import { TweetEntitiesV2, TwitterApi } from 'twitter-api-v2'
import { Post } from './mastodon'

type FetchTweetResponse = {
  tweetId: string
  tweet: string
}

const client = new TwitterApi({
  appKey: TWITTER_CONSUMER_KEY,
  appSecret: TWITTER_CONSUMER_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN_KEY,
  accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
})

// const client = new TwitterApi(TWITTER_AUTH_BEARER_TOKEN)

console.log('client', client)

function checkTwitterSecrets() {
  if (isEmpty(TWITTER_AUTH_BEARER_TOKEN)) {
    throw new Error(
      `The TWITTER_AUTH_BEARER_TOKEN is missing in your environment`,
    )
  }
  if (isEmpty(TWITTER_CONSUMER_KEY)) {
    throw new Error(`The TWITTER_CONSUMER_KEY is missing in your environment`)
  }
  if (isEmpty(TWITTER_CONSUMER_SECRET)) {
    throw new Error(
      `The TWITTER_CONSUMER_SECRET is missing in your environment`,
    )
  }
  if (isEmpty(TWITTER_ACCESS_TOKEN_KEY)) {
    throw new Error(
      `The TWITTER_ACCESS_TOKEN_KEY is missing in your environment`,
    )
  }
  if (isEmpty(TWITTER_ACCESS_TOKEN_SECRET)) {
    throw new Error(
      `The TWITTER_ACCESS_TOKEN_SECRET is missing in your environment`,
    )
  }
}

function expandUrls(urls: TweetEntitiesV2['urls'], text: string): string {
  let modifiedMessage = `${text}`
  for (const item of urls) {
    modifiedMessage = text.replace(item.url, item.expanded_url)
  }
  return modifiedMessage
}

export async function tweet(post: Post) {
  // post to twitter
  await client.v2.tweet({
    text: `${post.text ?? ''} \nvia: ${post.url}`,
  })
  // await client.v1.tweet(`${post.text ?? ''} \nvia: ${post.url}`)
}

export async function fetchLatestTweet(): Promise<FetchTweetResponse | void> {
  checkTwitterSecrets()
  const {
    data: { id: userId, username },
  } = await client.v2.me()
  console.log('me', { userId, username })
  const { data } = await client.v2.userTimeline(userId, {
    max_results: 1,
    exclude: ['replies', 'retweets'],
  })
  console.log('userTimeline', data)
  const rencentTweet = data.data[0]
  const { text, id, in_reply_to_user_id, referenced_tweets, entities } =
    rencentTweet

  // 假设expandUrls是一个处理URL的函数，这里需要您根据实际情况来实现
  const modifiedTweet = expandUrls(entities?.urls ?? [], text)

  // 这里您可以根据需要对modifiedTweet进行进一步处理
  console.log('modifiedTweet', modifiedTweet) // 仅作为示例输出处理后的推文

  return {
    tweetId: id,
    tweet: modifiedTweet + '\n' + `https://x.com/${username}/status/${id}`,
  }
}
