import { clsx } from 'clsx';import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
export function Button({className,...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button className={clsx('rounded-xl bg-slate-950 px-4 py-2 font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-60 dark:bg-marigold dark:text-slate-950',className)} {...props}/>}
export function Card({children,className}:PropsWithChildren<{className?:string}>){return <section className={clsx('glass rounded-3xl p-6 shadow-xl shadow-orange-900/5',className)}>{children}</section>}
export function Badge({children}:{children:React.ReactNode}){return <span className="rounded-full bg-marigold/15 px-3 py-1 text-sm font-semibold text-amber-700 dark:text-amber-200">{children}</span>}
export function Empty({title}:{title:string}){return <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">{title}</div>}
