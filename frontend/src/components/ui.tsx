import { clsx, type ClassValue } from 'clsx';
import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 font-semibold text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-marigold dark:text-slate-950', className)} {...props} />;
}

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn('glass rounded-lg p-6 shadow-xl shadow-orange-900/5', className)}>{children}</section>;
}

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn('inline-flex rounded-full bg-marigold/15 px-3 py-1 text-sm font-semibold text-amber-700 dark:text-amber-200', className)}>{children}</span>;
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return <div className="rounded-lg border border-dashed p-8 text-center text-slate-500"><p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>{text ? <p className="mt-1 text-sm">{text}</p> : null}</div>;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-kolam focus:ring-2 focus:ring-kolam/20 dark:border-slate-700', className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-kolam focus:ring-2 focus:ring-kolam/20 dark:border-slate-700', className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-kolam focus:ring-2 focus:ring-kolam/20 dark:border-slate-700', className)} {...props} />;
}

export function Field({ label, children }: PropsWithChildren<{ label: string }>) {
  return <label className="grid gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300"><span>{label}</span>{children}</label>;
}

export function PageHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div>{eyebrow ? <p className="text-sm font-bold uppercase tracking-wide text-kolam">{eyebrow}</p> : null}<h1 className="text-4xl font-black tracking-tight md:text-5xl">{title}</h1></div>{action}</div>;
}
