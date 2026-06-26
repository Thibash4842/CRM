import { useState } from 'react';
import AccountDirectory from '../components/accounts/AccountDirectory';
import AccountProfile from '../components/accounts/AccountProfile';
import AccountInsights from '../components/accounts/AccountInsights';
import { ACCOUNTS_MOCK_DATA, ACCOUNT_CONTACTS, ACCOUNT_DEALS } from '../utils/mockAccountsData';

export default function Accounts() {
  const [accounts, setAccounts] = useState(ACCOUNTS_MOCK_DATA);
  const [selectedAccountId, setSelectedAccountId] = useState(ACCOUNTS_MOCK_DATA[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // Get related data for the selected account
  const accountContacts = ACCOUNT_CONTACTS.filter(c => c.accountId === selectedAccountId);
  const accountDeals = ACCOUNT_DEALS.filter(d => d.accountId === selectedAccountId);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden -m-6 bg-slate-50 dark:bg-slate-950">

      {/* LEFT SIDEBAR: ACCOUNT DIRECTORY */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 z-10">
        <AccountDirectory
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* CENTER PANEL: ACCOUNT 360 VIEW */}
      <div className="flex-1 min-w-0 flex flex-col bg-slate-50 dark:bg-slate-950 z-0">
        {selectedAccount ? (
          <AccountProfile
            account={selectedAccount}
            contacts={accountContacts}
            deals={accountDeals}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select an account to view details
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: AI INSIGHTS & HEALTH */}
      <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col border-l border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 z-10 overflow-y-auto hidden lg:flex">
        {selectedAccount && (
          <AccountInsights account={selectedAccount} />
        )}
      </div>

    </div>
  );
}
