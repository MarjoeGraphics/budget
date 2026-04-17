import { useAppStore } from './store/useAppStore'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Statistics from './pages/Statistics'
import MonthlyDues from './pages/MonthlyDues'
import Settings from './pages/Settings'
import { AnimatePresence, motion } from 'framer-motion'

const tabOrder = ['home', 'stats', 'dues', 'settings']

function App() {
  const { activeTab, prevTab } = useAppStore()

  const getDirection = () => {
    const currentIndex = tabOrder.indexOf(activeTab)
    const prevIndex = tabOrder.indexOf(prevTab)
    return currentIndex > prevIndex ? 1 : -1
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <Home />
      case 'stats':
        return <Statistics />
      case 'dues':
        return <MonthlyDues />
      case 'settings':
        return <Settings />
      default:
        return <Home />
    }
  }

  return (
    <Layout>
      <div className="relative">
        <AnimatePresence mode="popLayout" initial={false} custom={getDirection()}>
          <motion.div
            key={activeTab}
            custom={getDirection()}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="w-full"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </Layout>
  )
}

export default App
