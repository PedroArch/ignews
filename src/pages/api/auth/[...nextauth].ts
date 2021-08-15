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

  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
    verificationOptions: {
      algorithms: ["HS512"]
    }
  },
  
  
  callbacks: {
    async session(session) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        )
  
        return {
          ...session,
          activeSubscription: userActiveSubscription
        };

      } catch(err) {

        return {
          ...session,
          acitveSubscription: null
        }
      }

    


    },

    async signIn(user) {
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
    },
  }
})