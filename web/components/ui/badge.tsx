'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Badge = ({ className, ...props }: BadgeProps) => {
	return (
		<div
			className={cn(
				'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
				'border-slate-200 bg-slate-100 text-slate-700',
				className
			)}
			{...props}
		/>
	)
}


