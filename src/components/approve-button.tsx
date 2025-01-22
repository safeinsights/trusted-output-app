import { FC } from 'react'
import { useApproveRun } from '@/app/requests'
import { Button } from '@mantine/core'

export const Approve: FC<{ fileName: string }> = ({ fileName }) => {
    const approve = useApproveRun()
    return <Button onClick={() => approve.mutate(fileName)}>Approve</Button>
}
