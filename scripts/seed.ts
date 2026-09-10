import { config } from 'dotenv';
config();

import { PrismaClient as PostgresClient } from '../generated/postgres-client';
import { PrismaClient as MongoClient } from '../generated/mongo-client';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const users = [
  {
    email: 'ana.gomez@example.com',
    password: 'Password123!',
    name: 'Ana Gómez',
  },
  {
    email: 'luis.rojas@example.com',
    password: 'Password123!',
    name: 'Luis Rojas',
  },
  {
    email: 'carla.mendez@example.com',
    password: 'Password123!',
    name: 'Carla Méndez',
  },
  {
    email: 'diego.torres@example.com',
    password: 'Password123!',
    name: 'Diego Torres',
  },
];

const workshops = [
  {
    name: 'Git Fundamentals',
    description:
      'Control de versiones con Git: commits, ramas, merges y flujos de trabajo colaborativos.',
    imageUrl:
      'https://img-c.udemycdn.com/course/480x270/2632604_bd8e.jpg?w=3840&q=75',
    capacity: 5,
  },
  {
    name: 'Java',
    description:
      'Introducción a la programación orientada a objetos con Java y su ecosistema.',
    imageUrl:
      'https://img-c.udemycdn.com/course/480x270/6470463_1b6a.jpg',
    capacity: 4,
  },
  {
    name: 'Go',
    description:
      'Primeros pasos con Go: concurrencia, tipado estático y performance.',
    imageUrl:
      'https://pbs.twimg.com/media/HRqoLo_WEAESlpb?format=webp&name=medium',
    capacity: 4,
  },
  {
    name: 'Angular',
    description:
      'Construye aplicaciones web modernas con Angular, TypeScript y RxJS.',
    imageUrl:
      'https://img-c.udemycdn.com/course/480x270/3902998_5691_4.jpg?w=3840&q=75',
    capacity: 5,
  },
  {
    name: 'Spring Boot',
    description:
      'Desarrollo de backends empresariales con Spring Boot y Java.',
    imageUrl:
      'https://img-c.udemycdn.com/course/750x422/6737997_051e.jpg',
    capacity: 4,
  },
  {
    name: 'Scala',
    description:
      'Programación funcional y orientada a objetos con Scala en la JVM.',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6rAeOhqBEOU5wHMErXdcUpeHi2pYf8cXDPMUUeLLWqkWrFlNHcN-XihE&s=10',
    capacity: 3,
  },
  {
    name: 'C#',
    description:
      'Fundamentos de C# y el ecosistema .NET para desarrollo de aplicaciones.',
    imageUrl:
      'https://img-c.udemycdn.com/course/480x270/2617968_8c32_7.jpg',
    capacity: 4,
  },
  {
    name: 'SQL Fundamentals',
    description:
      'Bases de datos relacionales, consultas SQL y modelado de datos.',
    imageUrl:
      'https://img-c.udemycdn.com/course/480x270/2223970_3ab6_3.jpg?w=3840&q=75',
    capacity: 5,
  },
  {
    name: 'Azure Fundamentals',
    description:
      'Introducción a los servicios cloud de Microsoft Azure.',
    imageUrl:
      'https://img-c.udemycdn.com/course/480x270/6233031_c1c4.jpg?w=3840&q=75',
    capacity: 3,
  },
  {
    name: 'Laravel',
    description:
      'Desarrollo web con PHP y Laravel: rutas, controladores, Eloquent y más.',
    imageUrl:
      'https://cursotecaplus.com/wp-content/uploads/2026/09/crea-sistema-completo-para-ofrecer-viajes-compartidos-curso-udemy-cursoteca.jpg',
    capacity: 4,
  },
  {
    name: 'React',
    description:
      'Crea interfaces interactivas con React, hooks y el ecosistema moderno.',
    imageUrl:
      'https://img-c.udemycdn.com/course/480x270/4495406_c997.jpg?w=3840&q=75',
    capacity: 5,
  },
  {
    name: 'Ruby',
    description:
      'Lenguaje Ruby y sus fundamentos para desarrollo web y scripting.',
    imageUrl:
      'https://i.ytimg.com/vi/ulBNEtVhSBc/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAwr7GKa2FGSuAvHIIROavkGYL66w',
    capacity: 3,
  },
];

async function main(): Promise<void> {
  const postgres = new PostgresClient();
  const mongo = new MongoClient();

  try {
    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
      await postgres.user.upsert({
        where: { email: user.email },
        update: { passwordHash, name: user.name },
        create: {
          email: user.email,
          passwordHash,
          name: user.name,
        },
      });
      console.log(`Seeded user: ${user.email}`);
    }

    for (const workshop of workshops) {
      await mongo.workshop.upsert({
        where: { name: workshop.name },
        update: workshop,
        create: workshop,
      });
      console.log(`Seeded workshop: ${workshop.name}`);
    }

    const seededUsers = await postgres.user.findMany({
      where: { email: { in: users.map((u) => u.email) } },
    });

    const seededWorkshops = await mongo.workshop.findMany({
      where: { name: { in: ['Scala', 'Angular'] } },
    });

    const scala = seededWorkshops.find((w) => w.name === 'Scala');
    const angular = seededWorkshops.find((w) => w.name === 'Angular');

    if (scala && angular) {
      const scalaReservations = seededUsers.slice(0, 2);
      const angularReservations = seededUsers.slice(0, 4);

      for (const user of scalaReservations) {
        const exists = await mongo.reservation.findUnique({
          where: {
            userId_workshopId: { userId: user.id, workshopId: scala.id },
          },
        });
        if (!exists) {
          await mongo.reservation.create({
            data: { userId: user.id, workshopId: scala.id },
          });
          console.log(`Seeded reservation: ${user.email} -> Scala`);
        }
      }

      for (const user of angularReservations) {
        const exists = await mongo.reservation.findUnique({
          where: {
            userId_workshopId: { userId: user.id, workshopId: angular.id },
          },
        });
        if (!exists) {
          await mongo.reservation.create({
            data: { userId: user.id, workshopId: angular.id },
          });
          console.log(`Seeded reservation: ${user.email} -> Angular`);
        }
      }
    }

    console.log('Seed completed successfully.');
  } finally {
    await postgres.$disconnect();
    await mongo.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
