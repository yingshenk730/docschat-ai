import { ArrowRight, Menu } from 'lucide-react'
import { Button } from './ui/button'
import useAuthActions from '@/hooks/useAuthActions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
const Navbar = () => {
  const { handleLogin } = useAuthActions()
  return (
    <div className="sticky inset-x-0 top-0  w-full h-14  shadow-md shadow-slate-400  flex items-center grainy-light">
      <div className="w-full max-w-screen-xl mx-auto flex justify-between px-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" className="w-8 h-8 logo" />
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-primary font-bold text-lg">
            DocsChat.AI
          </div>
        </div>
        <div className="hidden gap-3 sm:flex">
          <Button variant="ghost">Pricing</Button>
          <Button variant="ghost">FAQs</Button>
          <Button
            onClick={handleLogin}
            className="text-white/85 bg-primary hover:bg-sky-600">
            Get Started <ArrowRight className="ml-3 w-5 h-5" />
          </Button>
        </div>
        <div className="block gap-3 sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <Menu className=" stroke-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Pricing</DropdownMenuItem>
              <DropdownMenuItem>FAQs</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogin}>Login</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default Navbar
