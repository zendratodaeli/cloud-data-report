
const AuthLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout