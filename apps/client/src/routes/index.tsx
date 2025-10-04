import { createFileRoute } from "@tanstack/react-router";
import { LanguageSelector } from "@/components/language-selector";
import { useQuery } from "@tanstack/react-query";
import { publicCoursesOptions } from "@/services/courses/public-options";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data } = useQuery(publicCoursesOptions.list());

  const courses = data?.data || [];

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-bold text-3xl">Cursos Disponibles</h1>
        <LanguageSelector />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader>
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="mb-4 h-48 w-full rounded-md object-cover"
                />
              )}
              <CardTitle>{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="font-bold text-2xl text-primary">
                ${Number.parseFloat(course.price).toFixed(2)}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Ver Curso</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
