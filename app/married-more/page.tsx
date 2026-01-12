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
      setError("These dates don't look right, please double-check.")
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
        <div className="flex items-start gap-3 rounded-2xl bg-[#C4A4A4]/10 p-4 text-[#4A5D4A] ring-1 ring-[#C4A4A4]/30">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#C4A4A4]/20 text-xs font-semibold">!</span>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Let's fix a couple of dates before we continue.</p>
            <p className="text-xs text-[#7A8A7A]">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dob" className="text-[#4A5D4A] font-medium">
              Date of birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={birthInput}
              onChange={(e) => setBirthInput(e.target.value)}
              className="bg-white/80 border-[#C4A4A4]/30 text-[#4A5D4A] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A4A4] focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wedding" className="text-[#4A5D4A] font-medium">
              Wedding date
            </Label>
            <Input
              id="wedding"
              type="date"
              value={weddingInput}
              onChange={(e) => setWeddingInput(e.target.value)}
              className="bg-white/80 border-[#C4A4A4]/30 text-[#4A5D4A] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A4A4] focus-visible:ring-offset-2"
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
            className="bg-[#C4A4A4] text-white shadow-sm hover:bg-[#B39494] rounded-full px-6 py-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A4A4] focus-visible:ring-offset-2"
          >
            Calculate MarriedMore date
          </Button>
        </motion.div>
      </form>

      {result && (
        <>
          <Separator className="my-4 bg-[#C4A4A4]/20" />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-[#C4A4A4]/20"
          >
            <div className="space-y-3">
              {result.weddingInFuture && (
                <p className="text-sm italic text-[#7A8A7A]">
                  Assuming you marry on this date, your MarriedMore day will be…
                </p>
              )}
              <p className="text-xs font-medium uppercase tracking-wide text-[#7A8A7A]">
                Your MarriedMore date
              </p>
              <div className="font-[var(--font-cormorant)] text-3xl font-semibold italic text-[#4A5D4A] md:text-4xl">
                {formatLongDate(result.marriedMoreDate)}
              </div>
              <p className="text-[#4A5D4A]">
                You'll be{' '}
                <span className="font-semibold text-[#C4A4A4]">
                  {result.ageYears} years old
                </span>{' '}
                on this day.
              </p>
              {result.isFuture ? (
                <p className="text-[#4A5D4A]">
                  You'll reach this milestone in{' '}
                  <span className="font-semibold text-[#C4A4A4]">
                    {result.daysDifference} days
                  </span>
                  .
                </p>
              ) : (
                <p className="text-[#4A5D4A]">
                  You reached this milestone{' '}
                  <span className="font-semibold text-[#C4A4A4]">
                    {result.daysDifference} days
                  </span>{' '}
                  ago. Congratulations! 💍
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}

      {!result && (
        <>
          <Separator className="my-4 bg-[#C4A4A4]/20" />
          <p className="text-sm text-[#7A8A7A]">
            Enter your dates to see when you'll have been married more than not.
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
      setError("Please enter your spouse's birth date & time.")
      return
    }

    const youBirth = parseInputDateTime(yourBirth)
    const spouseBirthDate = calculateForBoth ? parseInputDateTime(spouseBirth) : null
    const wedding = parseInputDateTime(weddingDateTime)
    if (!youBirth || !wedding || (calculateForBoth && !spouseBirthDate)) {
      setError("These dates don't look right, please double-check.")
      return
    }
    if (wedding.getTime() <= youBirth.getTime()) {
      setError('Your wedding date & time needs to be after your date & time of birth.')
      return
    }
    if (calculateForBoth && spouseBirthDate && wedding.getTime() <= spouseBirthDate.getTime()) {
      setError("Your wedding date & time needs to be after your spouse's date & time of birth.")
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
        <div className="flex items-start gap-3 rounded-2xl bg-[#C4A4A4]/10 p-4 text-[#4A5D4A] ring-1 ring-[#C4A4A4]/30">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#C4A4A4]/20 text-xs font-semibold">!</span>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Let's fix a couple of dates before we continue.</p>
            <p className="text-xs text-[#7A8A7A]">{error}</p>
          </div>
        </div>
      )}

      <p className="text-sm text-[#7A8A7A] md:text-base">
        See the exact moment you'll have been married more than not.
      </p>

      <div className="flex items-center justify-between rounded-2xl bg-white/60 p-4 ring-1 ring-[#C4A4A4]/20">
        <Label htmlFor="adv-both" className="text-[#4A5D4A] font-medium">
          Calculate for both of us
        </Label>
        <Switch
          id="adv-both"
          checked={calculateForBoth}
          onCheckedChange={setCalculateForBoth}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A4A4] focus-visible:ring-offset-2 data-[state=checked]:bg-[#C4A4A4]"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="you-birth" className="text-[#4A5D4A] font-medium">
              Your date & time of birth
            </Label>
            <Input
              id="you-birth"
              type="datetime-local"
              value={yourBirth}
              onChange={(e) => setYourBirth(e.target.value)}
              className="bg-white/80 border-[#C4A4A4]/30 text-[#4A5D4A] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A4A4] focus-visible:ring-offset-2"
            />
          </div>

          {calculateForBoth && (
            <div className="space-y-2">
              <Label htmlFor="spouse-birth" className="text-[#4A5D4A] font-medium">
                Spouse's date & time of birth
              </Label>
              <Input
                id="spouse-birth"
                type="datetime-local"
                value={spouseBirth}
                onChange={(e) => setSpouseBirth(e.target.value)}
                className="bg-white/80 border-[#C4A4A4]/30 text-[#4A5D4A] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A4A4] focus-visible:ring-offset-2"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="wedding-dt" className="text-[#4A5D4A] font-medium">
              Wedding date & time
            </Label>
            <Input
              id="wedding-dt"
              type="datetime-local"
              value={weddingDateTime}
              onChange={(e) => setWeddingDateTime(e.target.value)}
              className="bg-white/80 border-[#C4A4A4]/30 text-[#4A5D4A] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A4A4] focus-visible:ring-offset-2"
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
            className="bg-[#C4A4A4] text-white shadow-sm hover:bg-[#B39494] rounded-full px-6 py-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A4A4] focus-visible:ring-offset-2"
          >
            Calculate exact MarriedMore moment
          </Button>
        </motion.div>
      </form>

      {result ? (
        <>
          <Separator className="my-4 bg-[#C4A4A4]/20" />
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
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-[#C4A4A4]/20"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[#7A8A7A]">
                {result.you.label}
              </p>
              <div className="mt-2 font-[var(--font-cormorant)] text-2xl font-semibold italic text-[#4A5D4A] md:text-3xl">
                {formatLongDateTime(result.you.marriedMoreDateTime)}
              </div>
              <p className="mt-2 text-[#4A5D4A]">
                You'll be{' '}
                <span className="font-semibold text-[#C4A4A4]">
                  {result.you.ageYears} years old
                </span>
                .
              </p>
              {result.you.isFuture ? (
                <p className="text-[#4A5D4A]">
                  In{' '}
                  <span className="font-semibold text-[#C4A4A4]">
                    {result.you.days} days
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-[#C4A4A4]">
                    {result.you.hours} hours
                  </span>
                  .
                </p>
              ) : (
                <p className="text-[#4A5D4A]">
                  <span className="font-semibold text-[#C4A4A4]">
                    {result.you.days} days
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-[#C4A4A4]">
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
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
                className="rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-[#C4A4A4]/20"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-[#7A8A7A]">
                  {result.spouse.label}
                </p>
                <div className="mt-2 font-[var(--font-cormorant)] text-2xl font-semibold italic text-[#4A5D4A] md:text-3xl">
                  {formatLongDateTime(result.spouse.marriedMoreDateTime)}
                </div>
                <p className="mt-2 text-[#4A5D4A]">
                  They'll be{' '}
                  <span className="font-semibold text-[#C4A4A4]">
                    {result.spouse.ageYears} years old
                  </span>
                  .
                </p>
                {result.spouse.isFuture ? (
                  <p className="text-[#4A5D4A]">
                    In{' '}
                    <span className="font-semibold text-[#C4A4A4]">
                      {result.spouse.days} days
                    </span>{' '}
                    and{' '}
                    <span className="font-semibold text-[#C4A4A4]">
                      {result.spouse.hours} hours
                    </span>
                    .
                  </p>
                ) : (
                  <p className="text-[#4A5D4A]">
                    <span className="font-semibold text-[#C4A4A4]">
                      {result.spouse.days} days
                    </span>{' '}
                    and{' '}
                    <span className="font-semibold text-[#C4A4A4]">
                      {result.spouse.hours} hours
                    </span>{' '}
                    ago.
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {result.spouse && result.bothPast && (
            <p className="text-center text-sm text-[#7A8A7A]">
              You have both been MarriedMore—keep going. 💍
            </p>
          )}
        </>
      ) : (
        <>
          <Separator className="my-4 bg-[#C4A4A4]/20" />
          <p className="text-sm text-[#7A8A7A]">
            Enter your dates to see the exact moment you'll have been married more than not.
          </p>
        </>
      )}
    </div>
  )
}

export default function MarriedMorePage() {
  const [tabValue, setTabValue] = useState<'basic' | 'advanced'>('basic')

  return (
    <div className="relative min-h-[100svh] w-full bg-gradient-to-b from-[#FAF6F1] via-[#F8F4EF] to-[#F5F0EA] text-[#4A5D4A]">
      {/* Subtle texture overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#C4A4A4]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#C4A4A4]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 py-16 sm:px-8 sm:py-20 md:px-10 lg:px-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-2xl text-center"
        >
          <h1 className="mb-2 font-[var(--font-cormorant)] text-5xl font-medium italic text-[#4A5D4A] md:text-6xl">
            MarriedMore
          </h1>

          <p className="mb-8 text-base text-[#7A8A7A] md:text-lg">
            Building stronger partnerships
          </p>
        </motion.div>

        {/* Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="w-full max-w-2xl"
        >
          <Card className="rounded-3xl border-0 bg-white/70 shadow-lg backdrop-blur-sm ring-1 ring-[#C4A4A4]/10">
            <CardHeader className="space-y-2 pb-4 md:space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-[#C4A4A4]/10"
              >
                <p className="text-[#4A5D4A]">
                  Hey there! Welcome — I'm so glad you're here.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.35 }}
                className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-[#C4A4A4]/10"
              >
                <p className="text-[#4A5D4A]">
                  Find out the day you've officially spent more of your life married than not. A gentle reminder that every year together is a gift.
                </p>
              </motion.div>
            </CardHeader>
            <Separator className="bg-[#C4A4A4]/15" />
            <CardContent className="py-8">
              <div className="mx-auto w-full max-w-lg">
                <p className="mb-5 text-center text-sm text-[#7A8A7A] md:text-base">
                  Choose a simple date-only view—or the exact time for extra clarity.
                </p>

                <Tabs
                  value={tabValue}
                  onValueChange={(v) => setTabValue(v as 'basic' | 'advanced')}
                  className="w-full"
                >
                  <TabsList
                    className="grid w-full grid-cols-2 rounded-full bg-[#FAF6F1] p-1 ring-1 ring-[#C4A4A4]/20"
                  >
                    <TabsTrigger
                      value="basic"
                      className="rounded-full px-4 py-2.5 text-sm font-medium text-[#7A8A7A] transition-all data-[state=active]:bg-white data-[state=active]:text-[#E8B4BC] data-[state=active]:shadow-sm"
                    >
                      Basic
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="rounded-full px-4 py-2.5 text-sm font-medium text-[#7A8A7A] transition-all data-[state=active]:bg-white data-[state=active]:text-[#E8B4BC] data-[state=active]:shadow-sm"
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
