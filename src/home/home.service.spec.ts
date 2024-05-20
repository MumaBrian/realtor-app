import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '.prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockHome = {
  id: 1,
  address: 'molyko',
  city: 'Buea',
  price: 10000000,
  number_of_bathrooms: 6,
  number_of_bedrooms: 9,
  land_size: 444,
  propertyType: PropertyType.RESIDENTIAL,
  realtor_id: 1,
};

const mockGetHomes = [
  {
    id: 1,
    address: '2345 William Str',
    city: 'Toronto',
    price: 1500000,
    image: 'img1',
    property_type: PropertyType.RESIDENTIAL,
    images: [
      {
        url: 'src1',
      },
    ],
    number_of_bedrooms: 3,
    number_of_bathrooms: 2.5,
  },
];

const mockImages = [
  {
    id: 1,
    url: "src1",
  },
  {
    id: 2,
    url: "src2",
  }
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome)
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages)
            }
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Toronto',
      price: {
        gte: 1000000,
        lte: 1500000,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      });
    });

    it('should throw not found exception if no homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      address: 'molyko',
      numberOfBathrooms: 6,
      numberOfBedrooms: 9,
      city: 'Buea',
      landSize: 444,
      price: 10000000,
      propertyType: PropertyType.RESIDENTIAL,
      images: [
        {
          url: 'src1',
        },
      ],
    };

    it('should call prisma home.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 1);

      expect(mockCreateHome).toHaveBeenCalledWith({
        data: {
          address: 'molyko',
          number_of_bathrooms: 6,
          number_of_bedrooms: 9,
          city: 'Buea',
          land_size: 444,
          propertyType: PropertyType.RESIDENTIAL,
          price: 10000000,
          realtor_id: 1,
        },
      });
    });

    it('should call prisma image.createMany with the correct payload', async () => {
      const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);

      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateManyImage);

      await service.createHome(mockCreateHomeParams, 1);

      expect(mockCreateManyImage).toBeCalledWith({
        data: [
          {
            url: 'src1',
            home_id: 1,
          },
        ],
      });
    });
  });
});
