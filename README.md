
# Routine Tracker

Routine Tracker is a habit tracker application built using Next.js and React. This app allows users to track their daily habits, set goals, and visualize their progress over time.

## Prerequisites

Make sure you have the following installed on your system:

- Node.js (v14.x or later)
- npm or Yarn
- Git

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vivekSharmaDeveloper/Routine-Tracker.git
   cd Routine-Tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   # or if you're using yarn
   yarn install
   ```

## Development

To start the development server, run:

```bash
npm run dev
# or
yarn dev
```

This will start a local development server at `http://localhost:3000`.

## Build

To create an optimized production build, run:

```bash
npm run build
# or
yarn build
```

## Deployment

The application is ready to be deployed to platforms like Vercel.

1. Make sure to update the environment variables in Vercel.
2. Push your changes to the remote repository.
3. Trigger a deployment on Vercel or set it up to auto-deploy on push.

## Environment Variables

Ensure you set the following environment variables in your Vercel dashboard or a `.env.local` file in the root directory.

- `DATABASE_URL` - Connection string for your database.
- `NEXTAUTH_URL` - The URL where your Next.js app will be running.
- `SECRET_KEY` - A secret key for signing cookies.

## Contributing

Feel free to open issues or submit pull requests if you would like to contribute.

## License

This project is licensed under the MIT License.


