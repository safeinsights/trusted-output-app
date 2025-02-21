import { FC } from 'react'
import { useApproveJob } from '@/app/requests'
import { Button } from '@mantine/core'

export const Approve: FC<{ fileName: string }> = ({ fileName }) => {
    const approve = useApproveJob()
    return <Button onClick={() => approve.mutate(fileName)}>Approve</Button>
}
