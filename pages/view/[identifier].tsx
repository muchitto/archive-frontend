import { NextPage } from "next"
import { useRouter } from "next/router"

interface ViewProps {
    
}

const View: NextPage<ViewProps> = ({} : ViewProps) => {
    const router = useRouter()

    const identifier = router.query.identifier as string
    console.log(identifier)

    return (
        <>
        </>
    )
}

export default View