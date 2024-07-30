
const AuthLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-purple-50 to-white">
      <div>
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
