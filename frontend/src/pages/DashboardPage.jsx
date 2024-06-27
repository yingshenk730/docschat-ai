import { PlusCircle, LogOut, UserRound } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import RagHistoryCard from '@/components/RagHistoryCard'
import { useAuth } from '@/context/useAuth'
import useAuthActions from '@/hooks/useAuthActions'
import IndexCard from '@/components/IndexCard'
import { SIDEBAR_ICONS } from '@/lib/data'
import { Link } from 'react-router-dom'
import { useRAG } from '@/context/useRAG'

const DashboardPage = () => {
  const { user } = useAuth()
  // const [ragRecords, setRagRecords] = useState([])
  const { ragRecords, getRagHistory } = useRAG()
  const [open, setOpen] = useState(false)
  const { handleLogin, handleLogout } = useAuthActions()
  const [indexRes, setIndexRes] = useState('')
  const [pdfError, setPdfError] = useState('')
  const [urlError, setUrlError] = useState('')
  useEffect(() => {
    getRagHistory()
  }, [user, indexRes]) //eslint-disable-line

  useEffect(() => {
    if (!open) {
      setIndexRes('')
      setPdfError('')
      setUrlError('')
    }
  }, [open])

  return (
    <div className="flex min-h-screen w-full flex-col grainy-light">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <div className=" flex  items-center justify-center  rounded-full  h-8 w-8">
            <img src={user.picture} className="rounded-full" />
          </div>
          {SIDEBAR_ICONS.map((icon, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                    <icon.icon className="h-5 w-5" />
                    <span className="sr-only">{icon.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">{icon.label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 cursor-pointer"
                  onClick={user.name ? handleLogout : handleLogin}>
                  {user.name ? (
                    <LogOut className="h-5 w-5" />
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {user.name ? 'Logout' : 'Login'}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {user.name ? 'Logout' : 'Login'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14  border-b items-center justify-between bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src="/logo.svg" className="w-10 h-10 logo" />
            </Link>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-600 ">
              Create Your Knowledge Base
            </h1>
          </div>
          <div className=" flex  items-center justify-center  rounded-full  h-8 w-8 sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user.name ? (
                  <img src={user.picture} className="rounded-full" />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Upgrade</DropdownMenuItem>
                <DropdownMenuItem>FAQs</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span onClick={handleLogout} className=" cursor-pointer">
                    Logout
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="website">Website</TabsTrigger>
              </TabsList>

              <div className="ml-auto flex items-center ">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="h-8 flex items-center px-2 rounded-lg text-sm gap-1 text-slate-100 bg-gradient-to-r from-primary to-sky-400/85 hover:bg-gradient-to-r hover:from-sky-700 hover:to-sky-500 py-2 ">
                      <PlusCircle className="h-3.5 w-3.5 " />
                      <span>Add New File</span>
                    </button>
                  </DialogTrigger>
                  <IndexCard
                    indexRes={indexRes}
                    setIndexRes={setIndexRes}
                    pdfError={pdfError}
                    setPdfError={setPdfError}
                    urlError={urlError}
                    setUrlError={setUrlError}
                  />
                </Dialog>
              </div>
            </div>
            <TabsContent value="all">
              <RagHistoryCard ragRecords={ragRecords} />
            </TabsContent>
            {ragRecords.length > 0 && (
              <>
                <TabsContent value="pdf">
                  <RagHistoryCard
                    ragRecords={ragRecords.filter(
                      (record) => record.type === 'pdf'
                    )}
                  />
                </TabsContent>

                <TabsContent value="website">
                  <RagHistoryCard
                    ragRecords={ragRecords.filter(
                      (record) => record.type === 'website'
                    )}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage
