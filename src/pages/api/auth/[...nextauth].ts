import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import { fauna } from '../../../services/fauna'
import { query as q } from 'faunadb';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope:'read:user'
    }),
  ],
  // jwt: {
  //   signingKey: process.env.JWT_SIGNING_PRIVATE_KEY
  // },
  callbacks: {
    async signIn(user, account, profile) {
      const {name, email, image} = user

      try{
      await fauna.query(
        q.Create(
          q.Collection('users'),
          {data: {name, email, image}}
        )
      )
        return true
      } catch(err) {
      }
    }
  }
})