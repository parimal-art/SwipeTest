import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveView, checkForUnfinishedSession } from './store/appSlice';
import IntervieweeView from './components/IntervieweeView';
import InterviewerView from './components/InterviewerView';
import WelcomeBackModal from './components/WelcomeBackModal';
import Navigation from './components/Navigation';

function App() {
  const dispatch = useDispatch();
  const { activeView, showWelcomeBack } = useSelector(state => state.app);

  useEffect(() => {
    dispatch(checkForUnfinishedSession());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {activeView === 'interviewee' ? <IntervieweeView /> : <InterviewerView />}
      </main>

      {showWelcomeBack && <WelcomeBackModal />}
    </div>
  );
}

export default App;