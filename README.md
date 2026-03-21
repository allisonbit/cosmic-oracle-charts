# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🚀 Smart Contract Payment Integration

We have added a completely functional payment flow powered by a Solidity smart contract deployed on the Base network.

### 1. Smart Contract Deployment

To deploy the smart contract on the Base mainnet or testnet, you need to configure your environment:

1. Copy `.env.example` to `.env` if you haven't already.
2. In your `.env` file, include your deployment wallet's private key and RPC URL:
   ```env
   PRIVATE_KEY="your-private-key"
   RPC_URL="https://mainnet.base.org"
   ```
3. Run the hardhat deployment script:
   ```sh
   npx hardhat ignition deploy ignition/modules/OracleBullPayments.cjs --network base_mainnet
   ```

### 2. Frontend Configuration

After deploying, you need to link the contract back to the frontend:
1. Update your `.env` file with the deployed contract address:
   ```env
   VITE_CONTRACT_ADDRESS="0xYOUR_DEPLOYED_CONTRACT_ADDRESS"
   VITE_RPC_URL="https://mainnet.base.org"
   VITE_WALLET_CONNECT_PROJECT_ID="your_wallet_connect_project_id"
   ```
2. Run the application: `npm run dev`

### 3. Testing Payment Flow

Once everything is configured:
1. Navigate to the landing page and click the "Connect Wallet" button on the Premium Access card.
2. Ensure you are connected to the correct network (Base Mainnet).
3. Authorize the transaction to pay the target fee (0.01 ETH).
4. Upon successful transaction, the UI will reflect your "Paid" status and grant you full access to OracleBull traits.
