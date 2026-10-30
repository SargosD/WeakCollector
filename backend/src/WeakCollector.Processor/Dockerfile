FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props nuget.config global.json stylecop.json ./
COPY src/WeakCollector.Contracts/WeakCollector.Contracts.csproj src/WeakCollector.Contracts/
COPY src/WeakCollector.Processor/WeakCollector.Processor.csproj src/WeakCollector.Processor/
RUN dotnet restore src/WeakCollector.Processor/WeakCollector.Processor.csproj

COPY src/WeakCollector.Contracts/ src/WeakCollector.Contracts/
COPY src/WeakCollector.Processor/ src/WeakCollector.Processor/
RUN dotnet publish src/WeakCollector.Processor/WeakCollector.Processor.csproj \
    --configuration Release --no-restore --output /app

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS final
WORKDIR /app
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["dotnet", "WeakCollector.Processor.dll"]
