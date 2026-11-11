FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
RUN dotnet tool install --global dotnet-ef --version 10.0.14
ENV PATH="$PATH:/root/.dotnet/tools"

COPY .editorconfig Directory.Build.props Directory.Packages.props nuget.config global.json stylecop.json ./
COPY WeakCollector.Common/WeakCollector.Common.csproj WeakCollector.Common/
COPY WeakCollector.Data/WeakCollector.Data.csproj WeakCollector.Data/
RUN dotnet restore WeakCollector.Data/WeakCollector.Data.csproj

COPY WeakCollector.Common/ WeakCollector.Common/
COPY WeakCollector.Data/ WeakCollector.Data/
RUN dotnet ef migrations bundle --project WeakCollector.Data \
    --configuration Release --self-contained -r linux-x64 --output /app/efbundle

FROM mcr.microsoft.com/dotnet/runtime-deps:10.0 AS final
WORKDIR /app
COPY --from=build /app/efbundle .
USER $APP_UID
ENTRYPOINT ["sh", "-c", "exec ./efbundle --connection \"$Database__ConnectionString\""]
