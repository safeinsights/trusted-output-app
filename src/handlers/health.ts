export const health = async () => {
    return Response.json({ success: true, message: { status: 'ok' } })
}
