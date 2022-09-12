import type { GetServerSideProps, NextPage } from 'next'

interface HomeProps {
}

const Home: NextPage<HomeProps> = ({}: HomeProps) => {

  return (
    <>
      <div>
      </div>
    </>
  )
}

export default Home

export const getServerSideProps : GetServerSideProps<HomeProps> = async (context) => {
  return {
    props: {}
  }
}
