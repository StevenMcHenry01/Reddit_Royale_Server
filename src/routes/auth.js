// 3rd party imports
import express from 'express'
const router = express.Router()
import fetch from 'node-fetch'
import encode from 'nodejs-base64-encode'
import jwt from 'jsonwebtoken'

/*
      /api/auth/*
*/

router.get('/reddit', async (req, res) => {
  const authUrl = `${process.env.AUTH_URL}?client_id=${process.env.CLIENT_ID}&response_type=code&state=RANDOM_STRING&redirect_uri=${process.env.REDIRECT_URI}&duration=permanent&scope=identity read`
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Origin',
    req.header('origin') ||
      req.header('x-forwarded-host') ||
      req.header('referer') ||
      req.header('host')
  )
  res.redirect(authUrl)
})

const getTokens = async (code) => {
  const tokens = await fetch(
    `${process.env.TOKEN_URL}?grant_type=authorization_code&code=${code}&redirect_uri=${process.env.REDIRECT_URI}`,
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

  const tokensJSON = await tokens.json()

  return tokensJSON
}

router.get('/reddit/callback', async (req, res) => {
  const code = req.query.code

  // user denied access to reddit account
  if (!code) {
    res.redirect(`${process.env.FRONTEND_URL}/login?authorization=denied`)
    return
  }

  const token = await getTokens(code)

  console.log('access token: ' + token.access_token)

  if (token) {
    // store in JWT for future use when making api requests
    const accessToken = jwt.sign(
      { access_token: token.access_token },
      process.env.ACCESS_TOKEN_SECRET
    )
    const refreshToken = jwt.sign(
      { refresh_token: token.refresh_token },
      process.env.REFRESH_TOKEN_SECRET
    )

    // set tokens in session to access through app
    req.session.accessToken = accessToken
    req.session.refreshToken = refreshToken

    // get user info from reddit server
    const userInfo = await fetch(`${process.env.REDDIT_API_URL}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    })

    if (userInfo) {
      const userInfoJSON = await userInfo.json()
      const {
        name,
        icon_img,
        link_karma,
        comment_karma,
        num_friends,
        coins,
        is_gold,
        created,
      } = userInfoJSON
      const user = {
        name,
        icon_img,
        link_karma,
        comment_karma,
        num_friends,
        coins,
        is_gold,
        created,
        access_token: accessToken,
        refresh_token: refreshToken,
      }
      res.redirect(
        `${process.env.FRONTEND_URL}/callback?access_token=${accessToken}&refresh_token=${refreshToken}&name=${name}&icon_img=${icon_img}&link_karma=${link_karma}&comment_karma=${comment_karma}&num_friends=${num_friends}&coins=${coins}&is_gold=${is_gold}&created=${created}`
      )
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/login?invalid_user=true`)
    }
  } else {
    res.send('Error')
    console.log('Error in /reddit/callback')
  }
})

router.delete('/logout', (req, res) => {
  req.session = null
  res.send('Logged Out')
})

export default router
