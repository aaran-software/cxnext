'use client'

import React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTabs, type Tab } from '@/hooks/UseTabs'
import { cn } from '@/lib/utils'

export interface AnimatedContentTab extends Tab {
  content: React.ReactNode
}

interface AnimatedTabsProps {
  tabs: AnimatedContentTab[]
  defaultTabValue?: string
}

const transition = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.15,
}

const getHoverAnimationProps = (hoveredRect: DOMRect, navRect: DOMRect) => ({
  x: hoveredRect.left - navRect.left - 10,
  y: hoveredRect.top - navRect.top - 4,
  width: hoveredRect.width + 20,
  height: hoveredRect.height + 10,
})

function TabContent({ tab }: { tab: AnimatedContentTab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={transition}
      className="mt-3 rounded-xl border border-border/60 bg-card p-3 md:p-4"
    >
      <div className="space-y-4">{tab.content}</div>
    </motion.div>
  )
}

function Tabs({
  tabs,
  selectedTabIndex,
  setSelectedTab,
  onChange,
}: {
  tabs: Tab[]
  selectedTabIndex: number
  setSelectedTab: (input: [number, number]) => void
  onChange?: (id: string) => void
}) {
  const [buttonRefs, setButtonRefs] = React.useState<Array<HTMLSpanElement | null>>([])

  React.useEffect(() => {
    setButtonRefs((prev) => prev.slice(0, tabs.length))
  }, [tabs.length])

  const navRef = React.useRef<HTMLDivElement>(null)
  const navRect = navRef.current?.getBoundingClientRect()
  const selectedRect = buttonRefs[selectedTabIndex]?.getBoundingClientRect()
  const [hoveredTabIndex, setHoveredTabIndex] = React.useState<number | null>(null)
  const hoveredRect = buttonRefs[hoveredTabIndex ?? -1]?.getBoundingClientRect()

  return (
    <nav
      ref={navRef}
      className="relative z-0 flex items-center justify-start gap-1 overflow-x-auto overflow-y-hidden py-1.5"
      onPointerLeave={() => setHoveredTabIndex(null)}
    >
      {tabs.map((item, i) => {
        const isActive = selectedTabIndex === i

        return (
          <button
            key={item.value}
            className="relative z-20 flex h-8 cursor-pointer select-none items-center rounded-md bg-transparent px-3 text-sm transition-colors"
            onPointerEnter={() => setHoveredTabIndex(i)}
            onFocus={() => setHoveredTabIndex(i)}
            onClick={() => {
              setSelectedTab([i, i > selectedTabIndex ? 1 : -1])
              onChange?.(item.value)
            }}
            type="button"
          >
            <span
              ref={(el) => {
                buttonRefs[i] = el
              }}
              className={cn('block whitespace-nowrap', {
                'text-muted-foreground': !isActive,
                'font-semibold text-foreground': isActive,
              })}
            >
              <small>{item.label}</small>
            </span>
          </button>
        )
      })}

      <AnimatePresence>
        {hoveredRect && navRect ? (
          <motion.div
            key="hover"
            className="absolute left-0 top-0 z-10 rounded-md bg-muted"
            initial={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 0 }}
            animate={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 1 }}
            exit={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 0 }}
            transition={transition}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRect && navRect ? (
          <motion.div
            className="absolute bottom-0 left-0 z-10 h-[2px] bg-foreground"
            initial={false}
            animate={{
              width: selectedRect.width + 18,
              x: `calc(${selectedRect.left - navRect.left - 9}px)`,
              opacity: 1,
            }}
            transition={transition}
          />
        ) : null}
      </AnimatePresence>
    </nav>
  )
}

export function AnimatedTabs({ tabs, defaultTabValue }: AnimatedTabsProps) {
  const [hookProps] = React.useState(() => ({
    tabs: tabs.map(({ label, value, subRoutes }) => ({ label, value, subRoutes })),
    initialTabId: defaultTabValue ?? tabs[0]?.value ?? 'tab-0',
  }))

  const framer = useTabs(hookProps)
  const selectedTab = tabs.find((tab) => tab.value === framer.selectedTab.value) ?? tabs[0]

  if (!selectedTab) {
    return null
  }

  return (
    <div className="w-full">
      <div className="relative flex w-full items-center justify-between overflow-x-auto overflow-y-hidden border-b border-border">
        <Tabs {...framer.tabProps} />
      </div>
      <AnimatePresence mode="wait">
        <TabContent key={selectedTab.value} tab={selectedTab} />
      </AnimatePresence>
    </div>
  )
}
