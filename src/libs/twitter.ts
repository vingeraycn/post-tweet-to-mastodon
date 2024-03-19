// import chalk from 'chalk'
// import Twit from 'twit'
import {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
} from '../config'
import { isEmpty } from './validator'
import { TweetEntitiesV2, TwitterApi } from 'twitter-api-v2'

type FetchTweetResponse = {
  tweetId: string
  tweet: string
}

function expandUrls(urls: TweetEntitiesV2['urls'], text: string): string {
  let modifiedMessage = `${text}`
  for (const item of urls) {
    modifiedMessage = text.replace(item.url, item.expanded_url)
  }
  return modifiedMessage
}

export async function fetchLatestTweet(): Promise<FetchTweetResponse | void> {
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

  const client = new TwitterApi({
    appKey: TWITTER_CONSUMER_KEY,
    appSecret: TWITTER_CONSUMER_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN_KEY,
    accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
  })

  const {
    data: { id: userId },
  } = await client.v2.me()
  const { data } = await client.v2.userTimeline(userId, {
    max_results: 1,
    exclude: ['replies', 'retweets'],
  })
  const rencentTweet = data.data[0]
  const { text, id, in_reply_to_user_id, referenced_tweets, entities } =
    rencentTweet

  // 假设expandUrls是一个处理URL的函数，这里需要您根据实际情况来实现
  const modifiedTweet = expandUrls(entities?.urls ?? [], text)

  // 这里您可以根据需要对modifiedTweet进行进一步处理
  console.log(modifiedTweet) // 仅作为示例输出处理后的推文

  return { tweetId: id, tweet: modifiedTweet }
}
