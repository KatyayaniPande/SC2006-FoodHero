## FoodHero - A platform to connect those in need with those who have

Welcome to the official repository for NTU Course code SC2006 Software Engineering, TDDB-47 group project Foodhero!
![Mission](https://github.com/user-attachments/assets/e521b8e9-c354-4920-8f64-ef4a9d3a927e)

FoodHero aims to reduce the percentage of people experiencing food insecurity by connecting people in need with local supermarkets that have leftover food to distribute. FoodHero platform allows donors to post available food items, while beneficiaries can request them as needed. 

## Features 
  * User registration and authentication for different roles (Donor, Beneficiary, Admin).
  * Donation mangement: Donors are able to create,update and delete donation entries.
  * Beneficiary management: Beneficiaries can request and view available donations.
  * Admin controls: Admins have access to user management and can take on deliveries.
  * 24/7 Chatbot assistance for website guidance.
  * Google maps to display routes for location of admin to beneficiary.

<details>
  <summary>🎥 Demo Video</summary>

  [Video](https://www.youtube.com/watch?v=mvUtt7vF098)
</details>

<details>
  <summary>📊 Diagrams </summary>

  1.App Overview Diagram
  2. Use Case Diagram
  3. Architecture Diagram
  4. Class Diagram
  5. Sequence Diagrams
  6. Dialog Map

</details>

<details>
  <summary>📄 Documentation </summary>

  
  1. Software Requirements Specification
  2. Code and API Documentations
  3. Use Case Diagram and Descriptions
  4. User Interface Mockups
</details>


## Installation

  ### 1. Clone the repository:
  ```
  git clone https://github.com/softwarelab3/2006-TDDB-47
```
```
  cd 2006-TDDB-47
  ```
### 2. Install the required dependencies and nodes with : 
```
npm install

```

### 3. Run the development server with:
```
npm run dev

```
and finally open htp://localhost:3000 to view the application in any browser.

You are now ready to start your journey with FoodHero to minimise food wastage and to help those in need!


## Pre-configured users 

The following accounts were created for testing purposes. They will also be used for the demonstration of our project.

| Name     | Role         | Email                     | Password |
|----------|--------------|---------------------------|----------|
| Liu Cong | Donor        | donor1@gmail.com | password |
| Edmund   | Donor        | donor2@gmail.com | password |
| Hud      | Beneficiary  | beneficiary1@gmail.com | password |
| Dasmond  | Beneficiary  | beneficiary2@gmail.com | password |
| nill     | Admin        | admin1@gmail.com | password |
| nill     | Admin        | admin1@gmail.com | password |


## Usage

1. Create an account as a donor, beneficiary or admin. 
For admin account, your email has to be whitelisted by another admin before you are able to sign up as an admin.

2. Post donations (Donors): Add new donation items with details like food type, quantity, and consume by.

3. Request donations (Beneficiaries): Browse available donations and request items that are needed.

4. Admin management: View and mange all users and donations as well as whitelisting of new admins. 


## API Documentations

The FoodHero application has custom-built API endpoints to handle the main backend functionality. The API routes can be found in the ```/app/api``` directory. 
One example is the adminList API :
| Method | Endpoint               | Description                                         |
|--------|-------------------------|-----------------------------------------------------|
| POST   | `/api/adminList`        | Add an approved admin’s email                       |
| GET    | `/api/adminList`        | Retrieve a list of approved admins                  |
| DELETE | `/api/adminList`        | Remove an approved admin account                    |

Please refer to the [API Docs](https://github.com/user-attachments/files/17561519/API.Documentation.pdf) for each specific API route in this directory.

## APP Design

![image](https://github.com/user-attachments/assets/48e9f6dc-d841-4d64-a297-a59b8bfba0c2)



## Design patterns 

1. Singelton pattern
   - Ensures only one MongoDB connection instance is created across API routes.

2. Observer pattern 
  - Used to trigger notifications when a new donation is created 

## SOLID Principles



## Techonologies
  * Frontend: a,b,c

  * Backend: a,b,c
  * Authentication. NextAuth.js for secure athentication and session maangement.



## External APIs

1. Google Maps
[Link](https://developers.google.com/maps)

2. Gemini (Chatbot)
[Link](https://ai.google.dev/gemini-api?gad_source=1&gbraid=0AAAAACn9t640wmFS7HvY1pE8sHzWzsjgR&gclid=Cj0KCQjwj4K5BhDYARIsAD1Ly2penGvppLtgX5Mbjhqo7zavu4liFxiST4orVNN-LEPGRtfa9-Ytp-MaAqvhEALw_wcB)

3. Supermarket 
















You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
