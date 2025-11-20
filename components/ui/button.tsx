'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={cn(
					'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
					'h-10 px-4 py-2 bg-slate-900 text-white hover:bg-slate-900/90',
					className
				)}
				{...props}
			/>
		)
	}
)
Button.displayName = 'Button'


