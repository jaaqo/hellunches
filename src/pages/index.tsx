import App from '../components/App'
import getLunches from '../lib/lunches'

const Index = ({lunches}) => {
  return <App lunches={lunches} />
}

export const getStaticProps = async () => {
  const lunches = await getLunches()

  return {
    props: {
      lunches: JSON.parse(JSON.stringify(lunches))
    },
    revalidate: 60 * 60
  }
}

export default Index
