import { GetServerSideProps, NextPage } from "next"
import { useRouter } from "next/router"

interface ViewProps {
    
}

const View: NextPage<ViewProps> = ({} : ViewProps) => {
    const router = useRouter()

    const identifier = router.query.identifier as string

    return (
        <>
        </>
    )
}

export default View


export const getServerSideProps : GetServerSideProps<ViewProps> = async (context) => {
    const identifier = context.query.identifier as string

    return {
      props: {
      }
    }
  }