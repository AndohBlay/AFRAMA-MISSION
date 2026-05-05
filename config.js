// config.js - Auto-generated from .env
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://gjjyhjjkulyedjdohqev.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqanloamprdWx5ZWRqZG9ocWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDM3OTEsImV4cCI6MjA5MzQ3OTc5MX0.UoyrmiqvK7vkWJND-hC-JByk92AFdAQ5VECB7CXzgGs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function submitContactForm(formData) {
    const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
            name: formData.name,
            email: formData.email,
            level: formData.level,
            message: formData.message,
            created_at: new Date().toISOString()
        }])
    
    if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
    }
    return data
}

export async function getSchoolUpdates() {
    const { data, error } = await supabase
        .from('school_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
    
    if (error) {
        console.error('Error fetching updates:', error)
        return []
    }
    return data
}

export async function subscribeNewsletter(email) {
    const { data, error } = await supabase
        .from('subscribers')
        .insert([{ 
            email: email, 
            subscribed_at: new Date().toISOString() 
        }])
    
    if (error) throw new Error(error.message)
    return data
}
