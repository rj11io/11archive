export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-16">
      <section
        className="w-full max-w-lg text-center"
        aria-labelledby="maintenance-title"
      >
        <div
          className="mx-auto mb-8 flex size-14 items-center justify-center rounded-full border border-border bg-muted"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
          >
            <path d="M12 6V3" />
            <path d="M16.25 7.75 18.4 5.6" />
            <path d="M18 12h3" />
            <path d="m16.25 16.25 2.15 2.15" />
            <path d="M12 18v3" />
            <path d="m7.75 16.25-2.15 2.15" />
            <path d="M6 12H3" />
            <path d="M7.75 7.75 5.6 5.6" />
          </svg>
        </div>

        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Scheduled maintenance
        </p>
        <h1
          id="maintenance-title"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          We&apos;ll be back soon.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground">
          This website is currently under maintenance. We&apos;re working to
          bring it back online as soon as possible.
        </p>
      </section>
    </main>
  )
}
