import fetch from 'node-fetch'
import encode from 'nodejs-base64-encode'
import jwt from 'jsonwebtoken'

export const fetchTopSubreddits = async (decodedAccessToken) => {
  const res = await fetch(
    `${process.env.REDDIT_API_URL}/subreddits/popular?limit=30&show=all`,
    {
      headers: {
        Authorization: `Bearer ${decodedAccessToken}`,
      },
    }
  )
  return res
}

export const fetchSubredditList = async (decodedAccessToken, subName) => {
  console.log(decodedAccessToken)
  const sub = await fetch(
    `${process.env.REDDIT_API_URL}/api/subreddit_autocomplete_v2?query=${subName}&limit=10&include_over_18=true&include_profiles=false`,
    {
      headers: {
        Authorization: `Bearer ${decodedAccessToken}`,
      },
    }
  )
  return sub
}

export const refreshAccessToken = async (req) => {
  const decodedRefreshToken = await jwt.verify(
    req.headers.refresh_token,
    process.env.REFRESH_TOKEN_SECRET
  )

  // get refresh token
  const tokenRes = await fetch(
    `${process.env.TOKEN_URL}?grant_type=refresh_token&refresh_token=${decodedRefreshToken.refresh_token}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encode.encode(
          process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET,
          'base64'
        )}`,
      },
    }
  )

  // convert to json
  const tokenResJSON = await tokenRes.json()

  // create new jwt access token to send back in body of res
  const newAccessToken = jwt.sign(
    { access_token: tokenResJSON.access_token },
    process.env.ACCESS_TOKEN_SECRET
  )

  return [tokenResJSON.access_token, newAccessToken]
}