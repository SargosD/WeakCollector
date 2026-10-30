FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props nuget.config global.json stylecop.json ./
COPY src/WeakCollector.Contracts/WeakCollector.Contracts.csproj src/WeakCollector.Contracts/
COPY src/WeakCollector.Messaging/WeakCollector.Messaging.csproj src/WeakCollector.Messaging/
COPY src/WeakCollector.Ingestor/WeakCollector.Ingestor.csproj src/WeakCollector.Ingestor/
RUN dotnet restore src/WeakCollector.Ingestor/WeakCollector.Ingestor.csproj

COPY src/WeakCollector.Contracts/ src/WeakCollector.Contracts/
COPY src/WeakCollector.Messaging/ src/WeakCollector.Messaging/
COPY src/WeakCollector.Ingestor/ src/WeakCollector.Ingestor/
RUN dotnet publish src/WeakCollector.Ingestor/WeakCollector.Ingestor.csproj \
    --configuration Release --no-restore --output /app

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS final
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["dotnet", "WeakCollector.Ingestor.dll"]
