// import chalk from 'chalk'
// import Twit from 'twit'
import {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
} from '../config'
import { isEmpty } from './validator'
import { TwitterApi } from 'twitter-api-v2'

type FetchTweetResponse = {
  tweetId: string
  tweet: string
}

type TweetEntitiesUrls = {
  url: string
  expanded_url: string
  display_url: string
  indices: number[]
}

function expandUrls(urls: TweetEntitiesUrls[], text: string): string {
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

  // 准备请求参数
  const params = {
    count: 1,
    tweet_mode: 'extended',
  }

  // 发送请求获取用户的时间线并等待响应
  const response = await client.get('tweets', params)
  const tweet = response.data[0].full_text
  const tweetId = response.data[0].id
  const isRetweet = response.data[0].retweeted
  const inReplyToStatusId = response.data[0].in_reply_to_status_id
  const urls = response.data[0].entities?.urls

  // 如果是转发或回复，则不处理
  if (isRetweet || inReplyToStatusId) {
    return
  }

  // 假设expandUrls是一个处理URL的函数，这里需要您根据实际情况来实现
  const modifiedTweet = expandUrls(urls, tweet)

  // 这里您可以根据需要对modifiedTweet进行进一步处理
  console.log(modifiedTweet) // 仅作为示例输出处理后的推文

  // const client = new Twit({
  //   consumer_key: TWITTER_CONSUMER_KEY,
  //   consumer_secret: TWITTER_CONSUMER_SECRET,
  //   access_token: TWITTER_ACCESS_TOKEN_KEY,
  //   access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
  // })

  // const params = { count: 1, tweet_mode: 'extended' }

  // const { data } = await client.get('statuses/user_timeline', params)
  // const tweet = (data as any)[0].full_text
  // const tweetId = (data as any)[0].id_str
  // const isRetweet = (data as any)[0].retweeted
  // const inReplyToStatusId = (data as any)[0].in_reply_to_status_id
  // const urls: TweetEntitiesUrls[] = (data as any)[0]?.entities?.urls
  // if (isRetweet || inReplyToStatusId) {
  //   return
  // }
  // const modifiedTweet = expandUrls(urls, tweet)
  return { tweetId, tweet: modifiedTweet }
}
