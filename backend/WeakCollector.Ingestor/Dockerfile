FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY .editorconfig Directory.Build.props Directory.Packages.props nuget.config global.json stylecop.json ./
COPY WeakCollector.Common/WeakCollector.Common.csproj WeakCollector.Common/
COPY WeakCollector.Messaging/WeakCollector.Messaging.csproj WeakCollector.Messaging/
COPY WeakCollector.Ingestor/WeakCollector.Ingestor.csproj WeakCollector.Ingestor/
RUN dotnet restore WeakCollector.Ingestor/WeakCollector.Ingestor.csproj

COPY WeakCollector.Common/ WeakCollector.Common/
COPY WeakCollector.Messaging/ WeakCollector.Messaging/
COPY WeakCollector.Ingestor/ WeakCollector.Ingestor/
RUN dotnet publish WeakCollector.Ingestor/WeakCollector.Ingestor.csproj \
    --configuration Release --no-restore --output /app

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS final
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["dotnet", "WeakCollector.Ingestor.dll"]
