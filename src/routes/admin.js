// 3rd party imports
import express from 'express'
const router = express.Router()
import jwt from 'jsonwebtoken'

import {fetchTopSubreddits, fetchSubredditList, refreshAccessToken} from '../utils/adminTools'

/*
      /api/admin/
*/

router.get('/getTopSubs', async (req, res, next) => {
  console.log(req.headers.access_token)
  console.log(req.headers.refresh_token)
  if (req.headers.access_token && req.headers.refresh_token) {
    // decode jwt from header
    const decodedAccessToken = await jwt.verify(
      req.headers.access_token,
      process.env.ACCESS_TOKEN_SECRET
    )

    const topSubFirstRes = await fetchTopSubreddits(
      decodedAccessToken.access_token
    )
    // access token has expired
    if (topSubFirstRes.status === 401) {
      const tokenArray = await refreshAccessToken(req)

      // refetch with new access token
      const topSubSecondRes = await fetchTopSubreddits(tokenArray[0])

      if (topSubSecondRes.status > 399) {
        res.redirect(
          401,
          `${process.env.FRONTEND_URL}/logout?authorization=error`
        )
        return
      }

      //convert to json
      const topSubSecondResJSON = await topSubSecondRes.json()

      res.send({ data: topSubSecondResJSON, newAccessToken: tokenArray[1] })
      return
    }
    const topSubFirstResJSON = await topSubFirstRes.json()

    res.send({ data: topSubFirstResJSON, newAccessToken: null })
  } else {
    res.send('not authorized')
  }
})

router.get('/getSubredditList', async (req, res, next) => {
  if (
    req.headers.access_token &&
    req.headers.refresh_token &&
    req.headers.sub
  ) {
    // decode jwt from header
    const decodedAccessToken = await jwt.verify(
      req.headers.access_token,
      process.env.ACCESS_TOKEN_SECRET
    )

    const subFirstRes = await fetchSubredditList(
      decodedAccessToken.access_token,
      req.headers.sub
    )

    // access token has expired
    if (subFirstRes.status === 401) {
      // refresh token. tokenArray[0] = actual access token and tokenArray[1] = JWT
      const tokenArray = await refreshAccessToken(req)

      // refetch with new access token
      const subSecondRes = await fetchSubredditList(
        tokenArray[0],
        req.headers.sub
      )

      //convert to json
      const subSecondResJSON = await subSecondRes.json()

      if (subSecondRes.status > 399) {
        res.redirect(
          401,
          `${process.env.FRONTEND_URL}/logout?authorization=error`
        )
        return
      }

      res.send({ data: subSecondResJSON, newAccessToken: tokenArray[1] })
      return
    }

    const subFirstJSON = await subFirstRes.json()

    res.send({ data: subFirstJSON, newAccessToken: null })
  } else {
    res.send('not authorized')
  }
})

export default router
