import { date } from 'drizzle-orm/mysql-core'
import React from 'react'

const FooterPOS = () => {
    return (
        <div className='text-center text-muted-foreground text-sm p-4'>
            <p>&copy; {new Date().getFullYear()} Green Line Software</p>
        </div>
    )
}

export default FooterPOS