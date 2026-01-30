# 🩺 Healeo

**Problem Statement ID:** CS02HA  
**Team Name:** Void Insane  
**College:** St. Aloysius College  


# Healeo: Affordable Health Tracking for Rural Areas

Healeo is a web application designed to democratize access to healthcare by providing an affordable and efficient health tracking system for rural communities. It focuses on promoting regular medical check-ups and maintaining digital health records for patients, while empowering doctors and health workers with the tools they need.

## Problem Statement and Motivation

In many rural areas, access to consistent healthcare and the maintenance of personal health records remain significant challenges. Patients often lack a centralized system to track their health metrics, symptoms, and prescriptions, leading to fragmented care. Health workers face difficulties in efficient data collection and management, especially in low-connectivity environments. Healeo aims to bridge this gap by providing a robust, accessible, and secure platform that addresses these critical needs.

## Solution Overview

Healeo is a comprehensive health tracking system built with a modern tech stack, offering a user-friendly interface for patients, and powerful tools for healthcare providers. It features secure digital health records, a robust scheduling and reminder system, and crucial offline capabilities for health workers, all secured by role-based access control and advanced database security.

## Key Features

*   **Digital Health Records:** Securely store and manage vital health metrics such as blood pressure, sugar levels, symptoms, and prescriptions.
*   **Role-Based Access Control:** Differentiated access levels for patients, doctors, health workers, and administrators, ensuring data privacy and operational efficiency.
*   **Secure Medical Data:** Implemented with Supabase Row Level Security (RLS) to ensure that users can only access data relevant and permitted to their role.
*   **Regular Check-up Scheduling and Reminders:** Automated system for scheduling appointments and sending timely reminders via SMS or WhatsApp, promoting adherence to check-up schedules.
*   **Offline Data Entry with Sync Support:** Rural health workers can collect data even without internet connectivity, with automatic synchronization when a connection is restored.
*   **Multilingual, Mobile-First, Low-Bandwidth UI:** An intuitive and accessible user interface optimized for mobile devices and designed to function effectively in low-bandwidth environments.
*   **Secure Storage for Medical Reports and Prescriptions:** Utilizes Supabase Storage for encrypted and secure storage of sensitive documents.

## Tech Stack

*   **Frontend:** Next.js (App Router), React, Tailwind CSS
*   **Backend:** Supabase (PostgreSQL Database, Authentication, Storage, Row Level Security, Edge Functions)
*   **Authentication:** Phone Number One-Time Password (OTP)
*   **Deployment:** Vercel (Frontend), Supabase (Backend)

## System Architecture Overview

Healeo follows a modern serverless architecture. The frontend, built with Next.js, is deployed on Vercel, providing fast and scalable serving of the user interface. The backend leverages Supabase, utilizing its PostgreSQL database for data storage, Supabase Auth for user authentication via phone number OTP, and Supabase Storage for secure handling of medical reports. Supabase Edge Functions can be used for custom backend logic and integrations (e.g., SMS/WhatsApp reminders). Row Level Security is meticulously configured to enforce data access policies directly at the database level.

## Database Schema Overview (High-level)

The database schema is designed to manage users, health records, appointments, and medical documents.

*   **`users` table:** Stores user profiles with `id`, `phone_number`, `role` (patient, doctor, health worker, admin).
*   **`patients` table:** Contains patient-specific information linked to the `users` table.
*   **`health_records` table:** Stores health metrics like `bp`, `sugar`, `symptoms`, `prescription_details`, linked to a `patient_id`.
*   **`appointments` table:** Manages `appointment_date`, `time`, `patient_id`, `doctor_id`, `status`.
*   **`medical_documents` table:** Stores references to files in Supabase Storage, linked to `patient_id`.
*   **`roles` table:** Defines different user roles and their permissions.

## Authentication & Security

Healeo employs phone number OTP for user authentication, providing a streamlined and secure login experience. A critical aspect of the application's security is **Supabase Row Level Security (RLS)**. RLS is implemented on all sensitive tables (e.g., `health_records`, `medical_documents`) to ensure that:

*   Patients can only view and manage their own health records.
*   Doctors can access the records of their assigned patients.
*   Health workers can access records for patients in their designated areas.
*   Administrators have broader oversight but with strict auditing.

This granular control at the database level prevents unauthorized data access, even if application-level security layers were to be compromised.

## 👥 User Roles & System Interaction

Healeo is designed around a **multi-user healthcare ecosystem** to ensure regular medical check-ups and continuous health monitoring, especially in rural areas.

The system supports four primary user roles:

---

### 👤 Patient

**Who they are:**  
Patients are individuals whose health data is being monitored. They may or may not own a smartphone.

**What they can do:**
- View their personal health records
- Receive reminders for regular medical check-ups
- Access prescriptions and doctor notes
- Track basic health trends over time

**How they interact with the system:**
- Log in using phone number OTP
- View data entered by medical workers or doctors
- Receive SMS/WhatsApp notifications for upcoming check-ups

---

### 🧑‍⚕️ Doctor

**Who they are:**  
Certified medical professionals responsible for diagnosis and treatment.

**What they can do:**
- View assigned patient health histories
- Add diagnoses and prescriptions
- Monitor long-term health trends
- Identify high-risk patients early

**How they interact with the system:**
- Access patient data securely via role-based permissions
- Update medical decisions after reviewing collected health records
- Provide treatment recommendations remotely or during health camps

---

### 🧑‍⚕️ Medical Worker (Health Worker)

**Who they are:**  
On-ground healthcare staff (e.g., ASHA workers, nurses, community health workers) who operate in rural areas.

**What they can do:**
- Register new patients
- Collect basic health vitals during field visits
- Upload medical reports or prescriptions
- Work offline and sync data when internet is available

**How they interact with the system:**
- Use a mobile-friendly interface during village visits
- Enter health data on behalf of patients
- Act as a bridge between patients and doctors
- Ensure patients follow regular check-up schedules

---

### 🛠 Admin

**Who they are:**  
System administrators responsible for managing the platform.

**What they can do:**
- Manage users and roles
- Monitor system usage and coverage
- Ensure data integrity and compliance
- Oversee clinics and health workers

**How they interact with the system:**
- Access analytics dashboards
- Perform administrative actions securely
- Maintain smooth system operations

---

## 🔄 Interaction Flow (High-Level)

1. **Medical Worker** visits a village and collects patient vitals  
2. Data is stored securely in the system (offline if needed)  
3. **Doctor** reviews health records and adds diagnosis/prescription  
4. **Patient** receives reminders and views health updates  
5. System schedules the next check-up automatically  

This workflow ensures **continuous, preventive, and accessible healthcare**.


## Setup & Installation Steps

To set up Healeo locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd healeo
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Supabase:**
    *   Create a new project on [Supabase](https://supabase.com/).
    *   Obtain your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from your project settings.
    *   Set up your database schema as outlined in the "Database Schema Overview" section. Refer to the Supabase documentation for detailed instructions on creating tables and setting up RLS policies.
    *   Enable Phone Auth in Supabase Authentication settings.

## Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase project credentials.

## Running the Project Locally

After setting up your environment variables and installing dependencies, you can run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment Instructions

Healeo is designed for seamless deployment with Vercel for the frontend and Supabase for the backend.

1.  **Vercel Deployment (Frontend):**
    *   Push your code to a Git repository (e.g., GitHub, GitLab, Bitbucket).
    *   Connect your repository to Vercel. Vercel will automatically detect the Next.js project.
    *   Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in your Vercel project settings.
    *   Vercel will build and deploy your application.

2.  **Supabase Deployment (Backend):**
    *   Your Supabase project is already deployed as part of your initial setup. Ensure your database schema and RLS policies are correctly configured.
    *   For any Supabase Edge Functions, deploy them using the Supabase CLI.

## Future Enhancements

*   Integration with external health devices (e.g., blood pressure monitors, glucose meters).
*   Advanced data analytics and reporting for healthcare providers.
*   Telemedicine integration for remote consultations.
*   AI-powered symptom checker and preliminary diagnosis assistance.
*   Enhanced notification system with push notifications.

