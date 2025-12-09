'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

// Utilities
function toLocalDateOnly(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day)
}
function toLocalDateTime(
  year: number,
  monthIndex: number,
  day: number,
  hours: number,
  minutes: number
) {
  return new Date(year, monthIndex, day, hours, minutes)
}
function parseInputDate(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map((v) => Number(v))
  if (!y || !m || !d) return null
  const date = toLocalDateOnly(y, m - 1, d)
  if (Number.isNaN(date.getTime())) return null
  return date
}
function parseInputDateTime(value: string): Date | null {
  // Expect "YYYY-MM-DDTHH:mm"
  if (!value) return null
  const [datePart, timePart] = value.split('T')
  if (!datePart || !timePart) return null
  const [y, m, d] = datePart.split('-').map((v) => Number(v))
  const [hh, mm] = timePart.split(':').map((v) => Number(v))
  if (
    [y, m, d, hh, mm].some((n) => Number.isNaN(n)) ||
    y === 0 ||
    m === 0 ||
    d === 0
  ) {
    return null
  }
  const date = toLocalDateTime(y, m - 1, d, hh, mm)
  if (Number.isNaN(date.getTime())) return null
  return date
}
function startOfDayLocal(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
function startOfDayUTCms(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}
function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
function formatLongDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
function yearsOnDate(birth: Date, onDate: Date): number {
  let years = onDate.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    onDate.getMonth() < birth.getMonth() ||
    (onDate.getMonth() === birth.getMonth() &&
      onDate.getDate() < birth.getDate())
  if (beforeBirthday) years--
  return years
}
function yearsOnDateTime(birth: Date, onDate: Date): number {
  let years = onDate.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    onDate.getMonth() < birth.getMonth() ||
    (onDate.getMonth() === birth.getMonth() &&
      (onDate.getDate() < birth.getDate() ||
        (onDate.getDate() === birth.getDate() &&
          (onDate.getHours() < birth.getHours() ||
            (onDate.getHours() === birth.getHours() &&
              onDate.getMinutes() < birth.getMinutes())))))
  if (beforeBirthday) years--
  return years
}
function diffDaysHours(from: Date, to: Date) {
  const diffMs = to.getTime() - from.getTime()
  const isFuture = diffMs > 0
  const abs = Math.abs(diffMs)
  const days = Math.floor(abs / 86400000)
  const hours = Math.floor((abs % 86400000) / 3600000)
  return { isFuture, days, hours }
}

// Types
type BasicCalcResult = {
  marriedMoreDate: Date
  ageYears: number
  isFuture: boolean
  daysDifference: number
  weddingInFuture: boolean
} | null
type AdvancedPersonResult = {
  label: 'You' | 'Your spouse'
  marriedMoreDateTime: Date
  ageYears: number
  isFuture: boolean
  days: number
  hours: number
}
type AdvancedResults = {
  you: AdvancedPersonResult
  spouse?: AdvancedPersonResult
  bothPast: boolean
} | null

function BasicCalculator() {
  const [birthInput, setBirthInput] = useState<string>('')
  const [weddingInput, setWeddingInput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BasicCalcResult>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!birthInput || !weddingInput) {
      setError('Please enter your date of birth and wedding date.')
      return
    }
    const birth = parseInputDate(birthInput)
    const wedding = parseInputDate(weddingInput)
    if (!birth || !wedding) {
      setError('These dates don’t look right, please double-check.')
      return
    }
    const birthDay = startOfDayLocal(birth)
    const weddingDay = startOfDayLocal(wedding)
    if (weddingDay.getTime() <= birthDay.getTime()) {
      setError('Your wedding date needs to be after your date of birth.')
      return
    }

    const xMs = 2 * weddingDay.getTime() - birthDay.getTime()
    const xDate = startOfDayLocal(new Date(xMs))

    const today = startOfDayLocal(new Date())
    const isFuture = xDate.getTime() > today.getTime()
    const daysDifference = Math.abs(
      Math.round((startOfDayUTCms(xDate) - startOfDayUTCms(today)) / 86400000)
    )
    const ageYears = yearsOnDate(birthDay, xDate)
    const weddingInFuture = weddingDay.getTime() > today.getTime()

    setResult({
      marriedMoreDate: xDate,
      ageYears,
      isFuture,
      daysDifference,
      weddingInFuture,
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-50/80 p-3 text-rose-700 ring-1 ring-rose-200/60">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold">!</span>
          <div className="space-y-0.5">
            <p className="text-sm">Let’s fix a couple of dates before we continue.</p>
            <p className="text-xs text-rose-600/90">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="dob" className="text-slate-800">
              Date of birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={birthInput}
              onChange={(e) => setBirthInput(e.target.value)}
              className="bg-white/90 focus-visible:outline-none focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="wedding" className="text-slate-800">
              Wedding date
            </Label>
            <Input
              id="wedding"
              type="date"
              value={weddingInput}
              onChange={(e) => setWeddingInput(e.target.value)}
              className="bg-white/90 focus-visible:outline-none focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <motion.div
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex"
        >
          <Button
            type="submit"
            className="bg-rose-600 text-white shadow-sm hover:bg-rose-600/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            Calculate MarriedMore date
          </Button>
        </motion.div>
      </form>

      {result && (
        <>
          <Separator className="my-2 opacity-50" />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="rounded-xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/60"
          >
            <div className="space-y-2">
              {result.weddingInFuture && (
                <p className="text-sm italic text-slate-500">
                  Assuming you marry on this date, your MarriedMore day will be…
                </p>
              )}
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Your MarriedMore date
              </p>
              <div className="text-2xl font-semibold text-rose-600 md:text-3xl">
                {formatLongDate(result.marriedMoreDate)}
              </div>
              <p className="text-slate-700">
                You’ll be{' '}
                <span className="font-medium text-rose-600">
                  {result.ageYears} years old
                </span>{' '}
                on this day.
              </p>
              {result.isFuture ? (
                <p className="text-slate-700">
                  You’ll reach this milestone in{' '}
                  <span className="font-medium text-rose-600">
                    {result.daysDifference} days
                  </span>
                  .
                </p>
              ) : (
                <p className="text-slate-700">
                  You reached this milestone{' '}
                  <span className="font-medium text-rose-600">
                    {result.daysDifference} days
                  </span>{' '}
                  ago. 🎉
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}

      {!result && (
        <>
          <Separator className="my-2 opacity-50" />
          <p className="text-sm text-slate-500">
            Enter your dates to see when you’ll have been married more than not.
          </p>
        </>
      )}
    </div>
  )
}

function AdvancedCalculator() {
  const [calculateForBoth, setCalculateForBoth] = useState<boolean>(false)
  const [yourBirth, setYourBirth] = useState<string>('')
  const [spouseBirth, setSpouseBirth] = useState<string>('')
  const [weddingDateTime, setWeddingDateTime] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AdvancedResults>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!yourBirth || !weddingDateTime) {
      setError('Please enter your birth date & time and your wedding date & time.')
      return
    }
    if (calculateForBoth && !spouseBirth) {
      setError('Please enter your spouse’s birth date & time.')
      return
    }

    const youBirth = parseInputDateTime(yourBirth)
    const spouseBirthDate = calculateForBoth ? parseInputDateTime(spouseBirth) : null
    const wedding = parseInputDateTime(weddingDateTime)
    if (!youBirth || !wedding || (calculateForBoth && !spouseBirthDate)) {
      setError('These dates don’t look right, please double-check.')
      return
    }
    if (wedding.getTime() <= youBirth.getTime()) {
      setError('Your wedding date & time needs to be after your date & time of birth.')
      return
    }
    if (calculateForBoth && spouseBirthDate && wedding.getTime() <= spouseBirthDate.getTime()) {
      setError('Your wedding date & time needs to be after your spouse’s date & time of birth.')
      return
    }

    const now = new Date()
    const youX = new Date(2 * wedding.getTime() - youBirth.getTime())
    const youAge = yearsOnDateTime(youBirth, youX)
    const youDiff = diffDaysHours(now, youX)
    const youRes: AdvancedPersonResult = {
      label: 'You',
      marriedMoreDateTime: youX,
      ageYears: youAge,
      isFuture: youDiff.isFuture,
      days: youDiff.days,
      hours: youDiff.hours,
    }

    let spouseRes: AdvancedPersonResult | undefined
    if (calculateForBoth && spouseBirthDate) {
      const spouseX = new Date(2 * wedding.getTime() - spouseBirthDate.getTime())
      const spouseAge = yearsOnDateTime(spouseBirthDate, spouseX)
      const spouseDiff = diffDaysHours(now, spouseX)
      spouseRes = {
        label: 'Your spouse',
        marriedMoreDateTime: spouseX,
        ageYears: spouseAge,
        isFuture: spouseDiff.isFuture,
        days: spouseDiff.days,
        hours: spouseDiff.hours,
      }
    }

    const bothPast = spouseRes ? !youRes.isFuture && !spouseRes.isFuture : false
    setResult({ you: youRes, spouse: spouseRes, bothPast })
  }

  return (
    <div className="space-y-6 text-left">
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-50/80 p-3 text-rose-700 ring-1 ring-rose-200/60">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold">!</span>
          <div className="space-y-0.5">
            <p className="text-sm">Let’s fix a couple of dates before we continue.</p>
            <p className="text-xs text-rose-600/90">{error}</p>
          </div>
        </div>
      )}

      <p className="text-sm text-slate-600 md:text-base">
        See the exact moment you’ll have been married more than not.
      </p>

      <div className="flex items-center justify-between rounded-xl bg-white/60 p-4 ring-1 ring-slate-200/60">
        <Label htmlFor="adv-both" className="text-slate-800">
          Calculate for both of us
        </Label>
        <Switch
          id="adv-both"
          checked={calculateForBoth}
          onCheckedChange={setCalculateForBoth}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 data-[state=checked]:bg-rose-600"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="you-birth" className="text-slate-800">
              Your date & time of birth
            </Label>
            <Input
              id="you-birth"
              type="datetime-local"
              value={yourBirth}
              onChange={(e) => setYourBirth(e.target.value)}
              className="bg-white/90 focus-visible:outline-none focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            />
          </div>

          {calculateForBoth && (
            <div className="space-y-1">
              <Label htmlFor="spouse-birth" className="text-slate-800">
                Spouse’s date & time of birth
              </Label>
              <Input
                id="spouse-birth"
                type="datetime-local"
                value={spouseBirth}
                onChange={(e) => setSpouseBirth(e.target.value)}
                className="bg-white/90 focus-visible:outline-none focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="wedding-dt" className="text-slate-800">
              Wedding date & time
            </Label>
            <Input
              id="wedding-dt"
              type="datetime-local"
              value={weddingDateTime}
              onChange={(e) => setWeddingDateTime(e.target.value)}
              className="bg-white/90 focus-visible:outline-none focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <motion.div
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex"
        >
          <Button
            type="submit"
            className="bg-rose-600 text-white shadow-sm hover:bg-rose-600/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            Calculate exact MarriedMore moment
          </Button>
        </motion.div>
      </form>

      {result ? (
        <>
          <Separator className="my-2 opacity-50" />
          <div
            className={
              result.spouse
                ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
                : 'grid grid-cols-1 gap-4'
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="rounded-xl bg-rose-50/70 p-6 shadow-sm ring-1 ring-rose-200/60"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                {result.you.label}
              </p>
              <div className="mt-1 text-xl font-semibold text-rose-600 md:text-2xl">
                {formatLongDateTime(result.you.marriedMoreDateTime)}
              </div>
              <p className="mt-1 text-slate-700">
                You’ll be{' '}
                <span className="font-medium text-rose-600">
                  {result.you.ageYears} years old
                </span>
                .
              </p>
              {result.you.isFuture ? (
                <p className="text-slate-700">
                  In{' '}
                  <span className="font-medium text-rose-600">
                    {result.you.days} days
                  </span>{' '}
                  and{' '}
                  <span className="font-medium text-rose-600">
                    {result.you.hours} hours
                  </span>
                  .
                </p>
              ) : (
                <p className="text-slate-700">
                  <span className="font-medium text-rose-600">
                    {result.you.days} days
                  </span>{' '}
                  and{' '}
                  <span className="font-medium text-rose-600">
                    {result.you.hours} hours
                  </span>{' '}
                  ago.
                </p>
              )}
            </motion.div>

            {result.spouse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut', delay: 0.03 }}
                className="rounded-xl bg-rose-50/70 p-6 shadow-sm ring-1 ring-rose-200/60"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                  {result.spouse.label}
                </p>
                <div className="mt-1 text-xl font-semibold text-rose-600 md:text-2xl">
                  {formatLongDateTime(result.spouse.marriedMoreDateTime)}
                </div>
                <p className="mt-1 text-slate-700">
                  They’ll be{' '}
                  <span className="font-medium text-rose-600">
                    {result.spouse.ageYears} years old
                  </span>
                  .
                </p>
                {result.spouse.isFuture ? (
                  <p className="text-slate-700">
                    In{' '}
                    <span className="font-medium text-rose-600">
                      {result.spouse.days} days
                    </span>{' '}
                    and{' '}
                    <span className="font-medium text-rose-600">
                      {result.spouse.hours} hours
                    </span>
                    .
                  </p>
                ) : (
                  <p className="text-slate-700">
                    <span className="font-medium text-rose-600">
                      {result.spouse.days} days
                    </span>{' '}
                    and{' '}
                    <span className="font-medium text-rose-600">
                      {result.spouse.hours} hours
                    </span>{' '}
                    ago.
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {result.spouse && result.bothPast && (
            <p className="text-center text-sm text-slate-600">
              You have both been MarriedMore—keep going. 💍
            </p>
          )}
        </>
      ) : (
        <>
          <Separator className="my-2 opacity-50" />
          <p className="text-sm text-slate-500">
            Enter your dates to see the exact moment you’ll have been married more than not.
          </p>
        </>
      )}
    </div>
  )
}

export default function MarriedMorePage() {
  const [tabValue, setTabValue] = useState<'basic' | 'advanced'>('basic')

  return (
    <div className="relative min-h-[100svh] w-full bg-gradient-to-b from-[#FFF9F3] via-[#FFF4F5] to-[#FDEDED] text-slate-700">
      {/* Ambient gradient blobs for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr from-rose-200/60 via-pink-100/40 to-transparent blur-3xl" />
        <div className="absolute -bottom-16 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-pink-200/60 via-rose-100/40 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-6 py-20 sm:px-8 sm:py-24 md:px-10 lg:px-12 lg:py-28">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-2xl text-center"
        >
          <div className="mb-4 flex w-full justify-center">
            <Badge
              className="rounded-full border border-rose-200/60 bg-rose-100 text-rose-700 shadow-sm"
            >
              Celebrate lasting love
            </Badge>
          </div>

          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">
            Find your <span className="text-rose-600">MarriedMore</span> date
          </h1>

          <p className="mx-auto max-w-xl text-base text-slate-600 md:text-lg">
            The day you’ve officially spent more of your life married than not.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            A gentle reminder that every year together is a gift.
          </p>
        </motion.div>

        {/* Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
          className="mt-8 w-full max-w-2xl"
        >
          <Card className="rounded-2xl border border-slate-200/60 bg-white/70 shadow-lg backdrop-blur-sm">
            <CardHeader className="space-y-1 md:space-y-2">
              <CardTitle className="text-xl text-slate-800">
                MarriedMore calculator
              </CardTitle>
              <CardDescription className="text-slate-600">
                Pick simple or advanced to find your MarriedMore milestone.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="py-10">
              <div className="mx-auto w-full max-w-lg">
                <p className="mb-4 text-center text-sm text-slate-600 md:text-base">
                  Choose a simple date-only view—or the exact time for extra clarity.
                </p>

                <Tabs
                  value={tabValue}
                  onValueChange={(v) => setTabValue(v as 'basic' | 'advanced')}
                  className="w-full"
                >
                  <TabsList
                    className="grid w-full grid-cols-2 rounded-full bg-transparent p-1 ring-1 ring-rose-200/60 backdrop-blur-sm"
                  >
                    <TabsTrigger
                      value="basic"
                      className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
                    >
                      Basic
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm"
                    >
                      Advanced
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="mt-6">
                    <AnimatePresence mode="wait" initial={false}>
                      {tabValue === 'basic' && (
                        <motion.div
                          key="basic-tab"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="space-y-6"
                        >
                          <BasicCalculator />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="advanced" className="mt-6">
                    <AnimatePresence mode="wait" initial={false}>
                      {tabValue === 'advanced' && (
                        <motion.div
                          key="advanced-tab"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="space-y-6 text-left"
                        >
                          <AdvancedCalculator />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


