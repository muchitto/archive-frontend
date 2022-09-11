import { GetServerSideProps, NextPage } from "next"

interface ViewProps {
  identifier: string
}

const View: NextPage<ViewProps> = ({ identifier }: ViewProps) => {
  return (
    <>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<ViewProps> = async (context) => {
  const identifier = context.query.identifier as string

  return {
    props: {
      identifier,

    }
  }
}

export default View
