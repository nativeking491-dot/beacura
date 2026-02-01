
import React, { useState } from 'react';
import {
  Quote, Play, ThumbsUp, Heart, Share2,
  Sparkles, Globe, X, Clock, ExternalLink,
  Search, Languages, Film, Brain, Flower2, MessageCircle
} from 'lucide-react';

interface VideoCategory {
  id: string;
  title: string;
  titleHindi: string;
  titleTelugu: string;
  icon: React.ReactNode;
  searchQuery: Record<string, string>;
  color: string;
  bgColor: string;
}

const Motivation: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | null>(null);

  const languages = [
    { code: 'English', label: 'English', flag: '🇺🇸' },
    { code: 'Hindi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'Telugu', label: 'తెలుగు', flag: '🇮🇳' }
  ];

  const categories: VideoCategory[] = [
    {
      id: 'meditation',
      title: 'Meditation',
      titleHindi: 'ध्यान',
      titleTelugu: 'ధ్యానం',
      icon: <Brain size={24} />,
      searchQuery: {
        English: 'guided meditation for addiction recovery',
        Hindi: 'ध्यान meditation hindi guided',
        Telugu: 'ధ్యానం telugu meditation'
      },
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'yoga',
      title: 'Yoga',
      titleHindi: 'योग',
      titleTelugu: 'యోగా',
      icon: <Flower2 size={24} />,
      searchQuery: {
        English: 'yoga for stress relief beginners',
        Hindi: 'योग yoga hindi swami ramdev',
        Telugu: 'యోగా telugu yoga beginners'
      },
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      id: 'recovery',
      title: 'Recovery Stories',
      titleHindi: 'रिकवरी गाइड',
      titleTelugu: 'రికవరీ గైడ్',
      icon: <Heart size={24} />,
      searchQuery: {
        English: 'addiction recovery motivation success story',
        Hindi: 'नशा मुक्ति addiction recovery hindi',
        Telugu: 'addiction recovery telugu motivation'
      },
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      id: 'therapy',
      title: 'Mental Health',
      titleHindi: 'मानसिक स्वास्थ्य',
      titleTelugu: 'మానసిక ఆరోగ్యం',
      icon: <MessageCircle size={24} />,
      searchQuery: {
        English: 'mental health therapy tips anxiety',
        Hindi: 'मानसिक स्वास्थ्य mental health hindi bk shivani',
        Telugu: 'మానసిక ఆరోగ్యం mental health telugu'
      },
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const getCategoryTitle = (category: VideoCategory) => {
    switch (selectedLanguage) {
      case 'Hindi': return category.titleHindi;
      case 'Telugu': return category.titleTelugu;
      default: return category.title;
    }
  };

  const openYouTubeSearch = (category: VideoCategory) => {
    const query = category.searchQuery[selectedLanguage];
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const successStories = [
    {
      name: "David K.",
      time: "2 Years Clean",
      story: "I lost everything to pills. Today, I have my family back and a steady job. Recovery helped me find my voice again.",
      img: "https://picsum.photos/seed/david/200"
    },
    {
      name: "Elena R.",
      time: "18 Months Clean",
      story: "The community here is what saved me. Knowing I wasn't alone in the middle of the night changed everything.",
      img: "https://picsum.photos/seed/elena/200"
    }
  ];

  // Featured curated playlists - these are verified working
  const curatedPlaylists = {
    English: [
      { title: 'Addiction Recovery Meditations', playlistId: 'PLB3F2CF45AA221C88', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400' },
      { title: 'TED Talks on Addiction', playlistId: 'PL70DEC2B0568B5469', thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=400' },
    ],
    Hindi: [
      { title: 'Best Motivational Video - Hindi', videoId: 'CRPhPUNNrVU', thumbnail: 'https://img.youtube.com/vi/CRPhPUNNrVU/hqdefault.jpg' },
      { title: 'How I QUIT DRUGS - Arvind Kumar', videoId: 'F2TChiFHi2Q', thumbnail: 'https://img.youtube.com/vi/F2TChiFHi2Q/hqdefault.jpg' },
      { title: 'Powerful Motivational Speech', videoId: 'TKpv_u4r18Y', thumbnail: 'https://img.youtube.com/vi/TKpv_u4r18Y/hqdefault.jpg' },
    ],
    Telugu: [
      { title: 'Addiction Recovery - Sadhguru', videoId: 'J2ie7Yw5qJs', thumbnail: 'https://img.youtube.com/vi/J2ie7Yw5qJs/hqdefault.jpg' },
      { title: 'Stop Smoking & Drinking - Venu Kalyan', videoId: 'iQfHKURjG9Y', thumbnail: 'https://img.youtube.com/vi/iQfHKURjG9Y/hqdefault.jpg' },
      { title: 'Telugu Motivation', videoId: 'nT_HXP6pQC4', thumbnail: 'https://img.youtube.com/vi/nT_HXP6pQC4/hqdefault.jpg' },
    ]
  };

  /* Video Modal Component */
  const VideoModal = ({ videoId, playlistId, onClose }: { videoId?: string, playlistId?: string, onClose: () => void }) => {
    // Construct embed URL
    let embedUrl = "";
    if (playlistId) {
      embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&modestbranding=1&rel=0`;
    } else if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    }

    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
          >
            <X size={24} />
          </button>
          <iframe
            src={embedUrl}
            title="Video Player"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  };

  const [activeVideo, setActiveVideo] = useState<{ playlistId?: string, videoId?: string } | null>(null);

  const currentPlaylists = curatedPlaylists[selectedLanguage as keyof typeof curatedPlaylists] || curatedPlaylists.English;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header with Language Selector */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mental Strength</h1>
          <p className="text-slate-500">Feed your mind with hope, knowledge, and recovery resources.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${selectedLanguage === lang.code
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Video Categories Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Globe size={20} className="text-indigo-500" />
            <span>Browse by Category</span>
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
            <Languages size={12} />
            {selectedLanguage}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => openYouTubeSearch(category)}
              className={`${category.bgColor} p-6 rounded-3xl border border-slate-100 shadow-sm text-left group cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden`}
            >
              <div className={`${category.color} mb-4 p-3 bg-white rounded-2xl inline-block shadow-sm`}>
                {category.icon}
              </div>
              <h4 className="font-bold text-slate-800 text-lg mb-2">
                {getCategoryTitle(category)}
              </h4>
              <p className="text-slate-500 text-sm mb-4">
                Find {category.title.toLowerCase()} videos in {selectedLanguage}
              </p>
              <div className={`flex items-center gap-2 ${category.color} font-bold text-sm group-hover:translate-x-1 transition-transform`}>
                <Search size={16} />
                <span>Search on YouTube</span>
                <ExternalLink size={14} />
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-5">
                <Film size={120} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Curated Playlists */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Play size={20} className="text-rose-500" />
          <span>Curated Playlists</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentPlaylists.map((playlist, idx) => (
            <div
              key={idx}
              onClick={() => setActiveVideo(
                (playlist as any).videoId
                  ? { videoId: (playlist as any).videoId }
                  : { playlistId: (playlist as any).playlistId }
              )}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 flex relative"
            >
              <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden bg-slate-200">
                <img
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="bg-white/90 p-3 rounded-full shadow-xl">
                    <Play size={20} className="text-teal-600 ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-2 py-0.5 rounded inline-block w-fit mb-2">
                  Playlist
                </span>
                <h4 className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                  {playlist.title}
                </h4>
                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                  <Play size={12} />
                  Play Now
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Quote Section */}
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-1 rounded-3xl shadow-xl">
        <div className="bg-white rounded-[1.4rem] p-8 md:p-12 text-center relative overflow-hidden">
          <Quote className="absolute top-4 left-4 text-slate-100" size={120} />
          <div className="relative z-10">
            <Sparkles className="mx-auto text-amber-400 mb-6" size={40} />
            <h2 className="text-2xl md:text-3xl font-bold italic text-slate-800 mb-4">
              "Healing is not linear, and it's okay to have bad days. What matters is that you keep choosing to move forward."
            </h2>
            <p className="text-teal-600 font-bold">- Recovery Community</p>
          </div>
          {/* Video Modal Overlay */}
          {activeVideo && (
            <VideoModal
              playlistId={activeVideo.playlistId}
              videoId={activeVideo.videoId}
              onClose={() => setActiveVideo(null)}
            />
          )}
        </div>
      </div>

      {/* Success Stories */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Heart size={20} className="text-teal-500" />
          <span>Success Stories</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {successStories.map((story, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4">
              <img src={story.img} alt={story.name} className="w-16 h-16 rounded-2xl object-cover" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{story.name}</h4>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-tighter">{story.time}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-slate-400 hover:text-teal-600"><ThumbsUp size={16} /></button>
                    <button className="text-slate-400 hover:text-indigo-600"><Share2 size={16} /></button>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{story.story}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">
          Read More Stories
        </button>
      </section>
    </div>
  );
};

export default Motivation;
