useEffect(() => {
    const fetchData = async () => {
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      if (subs) setSubmissions(subs);
      if (files) setPartnerFiles(files);
    };
    fetchData();

    // Setup Realtime listener safely
    const channel = supabase
      .channel('public:submissions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        (payload) => {
          setSubmissions((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => {
      supabase.removeChannel(channel);
      clearTimeout(timer);
    };
  }, []);