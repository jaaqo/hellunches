import App from '../components/App'
import getLunches from '../lib/lunches'

const Index = ({lunches, r}) => {
  return <App lunches={lunches} />
}

export const getServerSideProps = async () => {
  const lunches = await getLunches()

  return {
    props: {
      lunches: JSON.parse(JSON.stringify(lunches))
    }
  }
}

export default Index
