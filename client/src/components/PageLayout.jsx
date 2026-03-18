const PageLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default PageLayout;
