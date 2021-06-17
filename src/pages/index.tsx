import Head from 'next/head'
import { GetStaticProps} from 'next'

import { SubscribeButton } from '../components/SubscribeButton'

import styles from './home.module.scss'
import { stripe } from '../services/stripe'


interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({product}: HomeProps) {
  
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News About the <span> world.</span></h1>
          <p>
            Get acess to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>

        <img src="/images/avatar.svg" alt="avatar" />
      </main>
    </>
  )
}
// faz o fetch na camada do Next/Node e não no browser
// GetStaticProps faz o fetch uma vez e depois do revalidade faz novamente diminuindo
// as chamadas app
// GetServerSideProps faz chamada a API toda vez que a página é carregada
// Aqui é usado o getstatic pq a página é comum para todas (ex: Não usa info do usuário)
export const getStaticProps: GetStaticProps = async () => {
  // o segundo parametro tras as informações do produto além do preço
  // nessa aplicação não precisa ser passado, mas deixo como forma de help
  const price = await stripe.prices.retrieve('price_1J34IfJCsai3xu0gkUxJJODa', {
    expand: ['product']
    })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100),
  }
  
    
  
  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}